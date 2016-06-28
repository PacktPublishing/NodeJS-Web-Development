'use strict';

const Sequelize = require("sequelize");
const jsyaml    = require('js-yaml');
const fs        = require('fs');
const util      = require('util');
const EventEmitter = require('events');

class MessagesEmitter extends EventEmitter {}

const log   = require('debug')('messages:model-messages');
const error = require('debug')('messages:error');

var SQMessage;
var sequlz;

module.exports = new MessagesEmitter();

var connectDB = function() {
    
    if (SQMessage) return SQMessage.sync();
    
    return new Promise((resolve, reject) => {
        fs.readFile(process.env.SEQUELIZE_CONNECT, 'utf8', (err, data) => {
            if (err) reject(err);
            else resolve(data);
        });
    })
    .then(yamltext => jsyaml.safeLoad(yamltext, 'utf8'))
    .then(params => {
        log('Sequelize params '+ util.inspect(params));
        
        if (!sequlz) sequlz = new Sequelize(params.dbname, params.username, params.password, params.params);
        
        if (!SQMessage) SQMessage = sequlz.define('Message', {
            id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
            from: Sequelize.STRING,
            // /home, /note/view/key, /user/user-name
            namespace: Sequelize.STRING,
            message: Sequelize.STRING(1024),
            timestamp: Sequelize.DATE
        });
        return SQMessage.sync();
    });
};

module.exports.postMessage = function(from, namespace, message) {
    log('postMessage '+from +' '+ namespace +' '+ message);
    return connectDB()
    .then(SQMessage => SQMessage.create({
        // the id field is autoincrementing, therefore we do not
        // supply an id value because the database assigns us one 
        from, namespace, message, timestamp: new Date()
    }))
    .then(newmsg => {
        var toEmit = {
            id: newmsg.id,
            from: newmsg.from,
            namespace: newmsg.namespace,
            message: newmsg.message,
            timestamp: newmsg.timestamp
        };
        log('postMessage emit newmessage', util.inspect(toEmit));
        module.exports.emit('newmessage', toEmit);
    });
};

module.exports.destroyMessage = function(id, namespace) {
    log(`destroyMessage id=${id} namespace=${namespace}`)
    return connectDB()
    .then(SQMessage => SQMessage.find({ where: { id } }))
    .then(msg => msg.destroy())
    .then(result => {
        log('destroyMessage FINI '+ util.inspect({ id, namespace }));
        module.exports.emit('destroymessage', { id, namespace });
    });
};

module.exports.destroyMessages = function(namespace) {
    return connectDB()
    .then(SQMessage => SQMessage.findAll({ where: { namespace } }))
    .then(messages => {
        messages.map(message => message.destroy());
        return Promise.all(messages);
    });
};

module.exports.recentMessages = function(namespace) {
    return connectDB()
    .then(SQMessage => SQMessage.findAll({
        where: { namespace },
        order: 'timestamp DESC',
        limit: 20
    }))
    .then(messages => {
        // log('recentMessages '+ util.inspect(namespace) +' '+ util.inspect(messages));
        return messages.map(message => {
            return {
            id: message.id,
            from: message.from,
            namespace: message.namespace,
            message: message.message,
            timestamp: message.timestamp
            };
        });
    });
};
