'use strict';

const Sequelize = require("sequelize");
const jsyaml    = require('js-yaml');
const fs        = require('fs');
const util      = require('util');

const log   = require('debug')('users:model-users');
const error = require('debug')('users:error');

var SQUser;
var sequlz;

exports.connectDB = function() {
    
    if (SQUser) return SQUser.sync();
    
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
        log('Sequelize params '+ util.inspect(params));
        
        if (!sequlz) sequlz = new Sequelize(params.dbname, params.username, params.password, params.params);
        
        // These fields largely come from the Passport / Portable Contacts schema.
        // See http://www.passportjs.org/docs/profile
        //
        // The emails and photos fields are arrays in Portable Contacts.  We'd need to set up
        // additional tables for those.
        //
        // The Portable Contacts "id" field maps to the "username" field here
        if (!SQUser) SQUser = sequlz.define('User', {
            username: { type: Sequelize.STRING, unique: true },
            password: Sequelize.STRING,
            provider: Sequelize.STRING,
            familyName: Sequelize.STRING,
            givenName: Sequelize.STRING,
            middleName: Sequelize.STRING,
            emails: Sequelize.STRING(2048),
            photos: Sequelize.STRING(2048)
        });
        return SQUser.sync();
    });
};

exports.create = function(username, password, provider, familyName, givenName, middleName, emails, photos) {
    return exports.connectDB().then(SQUser => {
        return SQUser.create({
            username: username,
            password: password,
            provider: provider,
            familyName: familyName,
            givenName: givenName,
            middleName: middleName,
            emails: JSON.stringify(emails),
            photos: JSON.stringify(photos)
        });
    });
};

exports.update = function(username, password, provider, familyName, givenName, middleName, emails, photos) {
    return exports.find(username).then(user => {
        return user ? user.updateAttributes({
            password: password,
            provider: provider,
            familyName: familyName,
            givenName: givenName,
            middleName: middleName,
            emails: JSON.stringify(emails),
            photos: JSON.stringify(photos)
        }) : undefined;
    });
};

exports.destroy = function(username) {
    return exports.connectDB().then(SQUser => {
        return SQUser.find({ where: { username: username } })
    })
    .then(user => {
        if (!user) throw new Error('Did not find requested '+ username +' to delete');
        user.destroy();
        return;
    });
};

exports.find = function(username) {
    log('find  '+ username);
    return exports.connectDB().then(SQUser => {
        return SQUser.find({ where: { username: username } })
    })
    .then(user => user ? exports.sanitizedUser(user) : undefined);
};

exports.userPasswordCheck = function(username, password) {
    log('userPasswordCheck query= '+ username +' '+ password);
    return exports.connectDB().then(SQUser => {
        return SQUser.find({ where: { username: username } })
    })
    .then(user => {
        log('userPasswordCheck query= '+ username +' '+ password
            +' user= '+ (user && user != null ? user.username : "") +' '+ (user && user != null ? user.password : ""));
        if (!user) {
            return { check: false, username: username, message: "Could not find user" };
        } else if (user.username === username && user.password === password) {
            return { check: true, username: user.username };
        } else {
            return { check: false, username: username, message: "Incorrect password" };
        }
    });
};

exports.findOrCreate = function(profile) {
    return exports.find(profile.id).then(user => {
        if (user) return user;
        log('findOrCreate creating => '+ util.inspect(profile));
        return exports.create(profile.id, profile.password, profile.provider,
                       profile.familyName, profile.givenName, profile.middleName,
                       profile.emails, profile.photos);
    });
};

exports.listUsers = function() {
    return exports.connectDB()
    .then(SQUser => SQUser.findAll({}) )
    .then(userlist => userlist.map(user => exports.sanitizedUser(user)))
    .catch(err => console.error(err));
};

exports.sanitizedUser = function(user) {
    log(util.inspect(user));
    if (!user) throw new Error('No user to sanitize')
    return {
        id: user.username,
        username: user.username,
        provider: user.provider,
        familyName: user.familyName,
        givenName: user.givenName,
        middleName: user.middleName,
        emails: user.emails,
        photos: user.photos
    };
};
