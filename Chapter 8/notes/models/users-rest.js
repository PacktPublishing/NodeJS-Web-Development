'use strict';

const restify = require('restify');
const log   = require('debug')('notes:users-rest-client');
const error = require('debug')('notes:error');

var connectREST = function() {
    return new Promise((resolve, reject) => {
        try {
            resolve(restify.createJsonClient({
                url: process.env.USER_SERVICE_URL,
                version: '*'
            }));
        } catch (err) {
            reject(err);
        }
    })
    .then(client => {
        client.basicAuth('them', 'D4ED43C0-8BD6-4FE2-B358-7C0E230D11EF');
        return client;
    });
};

exports.create = function(username, password, provider, familyName, givenName, middleName, emails, photos) {
    return connectREST().then(client => {
        return new Promise((resolve, reject) => {
            client.post('/create-user', {
                username, password, provider, familyName, givenName, middleName, emails, photos
            },
            (err, req, res, obj) => {
                if (err) return reject(err);
                resolve(obj);
            });
        });
    });
};

exports.update = function(username, password, provider, familyName, givenName, middleName, emails, photos) {
    return connectREST().then(client => {
        return new Promise((resolve, reject) => {
            client.post('/update-user/'+ username, {
                password, provider, familyName, givenName, middleName, emails, photos
            },
            (err, req, res, obj) => {
                if (err) return reject(err);
                resolve(obj);
            });
        });
    });
};

exports.find = function(username) {
    return connectREST().then(client => {
        return new Promise((resolve, reject) => {
            client.get('/find/'+ username,
            (err, req, res, obj) => {
                if (err) return reject(err);
                resolve(obj);
            });
        });
    });
};

exports.userPasswordCheck = function(username, password) {
    return connectREST().then(client => {
        return new Promise((resolve, reject) => {
            client.post('/passwordCheck', {
                username, password
            },
            (err, req, res, obj) => {
                if (err) return reject(err);
                resolve(obj);
            });
        });
    });
};

exports.findOrCreate = function(profile) {
    return connectREST().then(client => {
        return new Promise((resolve, reject) => {
            client.post('/find-or-create', {
                username: profile.id, password: profile.password, provider: profile.provider,
                familyName: profile.familyName, givenName: profile.givenName, middleName: profile.middleName,
                emails: profile.emails, photos: profile.photos
            },
            (err, req, res, obj) => {
                if (err) {
                    error('findOrCreate returning error '+err.stack);
                    return reject(err);
                }
                resolve(obj);
            });
        });
    });
};

exports.listUsers = function() {
    return connectREST().then(client => {
        return new Promise((resolve, reject) => {
            client.get('/list', (err, req, res, obj) => {
                if (err) return reject(err);
                resolve(obj);
            });
        });
    });
};
