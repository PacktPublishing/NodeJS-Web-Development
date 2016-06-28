
const Sequelize = require("sequelize");
const jsyaml    = require('js-yaml');
const fs        = require('fs');
const util      = require('util');

const log   = require('debug')('notes:model-users');
const error = require('debug')('notes:error');

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
        sequlz = new Sequelize(params.dbname, params.username, params.password, params.params);
        
        // These fields largely come from the Passport / Portable Contacts schema.
        // See http://www.passportjs.org/docs/profile
        //
        // The emails and photos fields are arrays in Portable Contacts.  We'd need to set up
        // additional tables for those.
        //
        // The Portable Contacts "id" field maps to the "username" field here
        SQUser = sequlz.define('User', {
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
    return exports.connectDB()
    .then(SQUser => {
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
    return exports.find(username)
    .then(user => {
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

exports.find = function(username) {
    log('find  '+ username);
    return exports.connectDB()
    .then(SQUser => {
        return SQUser.find({ where: { username: username } })
    });
};

exports.userPasswordCheck = function(username, password) {
    return exports.find(username)
    .then(user => {
        log('userPasswordCheck '+ username +' '+ password +' '+ util.inspect(user));
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
    return exports.find(profile.username)
    .then(user => {
        if (user) return user;
        // else
        return exports.create(profile.id, null, profile.provider,
                       profile.name.familyName, profile.name.givenName, profile.name.middleName,
                       profile.emails, profile.photos);
    });
    
};

exports.listUsers = function() {
    return exports.connectDB()
    .then(SQUser => SQUser.findAll({}) )
    .then(userlist => {
        userlist.forEach(user => { console.log(util.inspect(user)); })
    })
    .catch(err => console.error(err));
    
}
