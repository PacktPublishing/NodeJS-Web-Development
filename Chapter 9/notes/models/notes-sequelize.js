'use strict';

const util      = require('util');
const fs        = require('fs-extra');
const jsyaml    = require('js-yaml');
const Sequelize = require("sequelize");

const log     = require('debug')('notes:sequelize-model');
const error   = require('debug')('notes:error');

const Note    = require('./Note');

exports.events = require('./notes-events');

var SQNote;
var sequlz;

exports.connectDB = function() {
    
    if (SQNote) return SQNote.sync();
    
    return new Promise((resolve, reject) => {
        fs.readFile(process.env.SEQUELIZE_CONNECT, 'utf8', (err, data) => {
            if (err) reject(err);
            else resolve(data);
        });
    })
    .then(yamltext => {
        return jsyaml.safeLoad(yamltext, 'utf8');
    })
    .then(params => {
        sequlz = new Sequelize(params.dbname, params.username, params.password, params.params);
        SQNote = sequlz.define('Note', {
            notekey: { type: Sequelize.STRING, primaryKey: true, unique: true },
            title: Sequelize.STRING,
            body: Sequelize.TEXT
        });
        return SQNote.sync();
    });
};

exports.create = function(key, title, body) {
    return exports.connectDB()
    .then(SQNote => {
        return SQNote.create({
            notekey: key,
            title: title,
            body: body
        });
    })
    .then(newnote => {
        exports.events.noteCreated({
            key: newnote.key,
            title: newnote.title,
            body: newnote.body
        });
        return newnote;
    });
};

exports.update = function(key, title, body) {
    return exports.connectDB()
    .then(SQNote => {
        return SQNote.find({ where: { notekey: key } });
    })
    .then(note => {
        if (!note) {
            throw new Error("No note found for key " + key);
        } else {
            return note.updateAttributes({
                title: title,
                body: body
            });
        }
    })
    .then(newnote => {
        exports.events.noteUpdate({
            key,
            title: newnote.title,
            body: newnote.body
        });
        return newnote;
    });
};

exports.read = function(key) {
    return exports.connectDB()
    .then(SQNote => {
        return SQNote.find({ where: { notekey: key } })
    })
    .then(note => {
        if (!note) {
            throw new Error("No note found for " + key);
        }
        return new Note(note.notekey, note.title, note.body);
    });
};

exports.destroy = function(key) {
    return exports.connectDB()
    .then(SQNote => {
        return SQNote.find({ where: { notekey: key } })
    })
    .then(note => note.destroy())
    .then(() => {
        exports.events.noteDestroy({ key });
        return;
    });
};

exports.keylist = function() {
    return exports.connectDB()
    .then(SQNote => {
        return SQNote.findAll({ attributes: [ 'notekey' ] })
    })
    .then(notes => {
        return notes.map(note => note.notekey);
    });
};

exports.count = function() {
    return exports.connectDB()
    .then(SQNote => {
        return SQNote.count();
    })
    .then(count => {
        log('COUNT '+ count);
        return count;
    });
};

