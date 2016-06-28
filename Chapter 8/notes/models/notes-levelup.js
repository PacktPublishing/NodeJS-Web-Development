'use strict';

const util    = require('util');
const levelup = require('levelup');

const log     = require('debug')('notes:levelup-model');
const error   = require('debug')('notes:error');

const Note    = require('./Note');

var db; // store the database connection here

function connectDB() {
    return new Promise((resolve, reject) => {
        if (db) return resolve(db);
        levelup(process.env.LEVELUP_DB_LOCATION || 'notes.levelup', {
            createIfMissing: true,
            valueEncoding: "json"
        },
        (err, _db) => {
            if (err) return reject(err);
            db = _db;
            resolve();
        });
    });
}

exports.update = exports.create = function(key, title, body) {
    return connectDB().then(() => {
        var note = new Note(key, title, body);
        return new Promise((resolve, reject) => {
            db.put(key, note, err => {
                if (err) reject(err);
                else resolve(note);
            });
        });
    });
};

exports.read = function(key) {
    return connectDB().then(() => {
        return new Promise((resolve, reject) => {
            db.get(key, (err, note) => {
                if (err) reject(err);
                else resolve(new Note(note.key, note.title, note.body));
            });
        });
    });
};

exports.destroy = function(key) {
    return connectDB().then(() => {
        return new Promise((resolve, reject) => {
            db.del(key, err => {
                if (err) reject(err);
                else resolve();
            });
        });
    });
};

exports.keylist = function() {
    return connectDB().then(() => {
        var keyz = [];
        return new Promise((resolve, reject) => {
            db.createReadStream()
              .on('data', data => keyz.push(data.key))
              .on('error', err => reject(err))
              .on('end',   ()  => resolve(keyz));
        });
    });
};

exports.count = function() {
    return connectDB().then(() => {
        var total = 0;
        return new Promise((resolve, reject) => {
            db.createReadStream()
              .on('data', data => total++)
              .on('error', err => reject(err))
              .on('end',   ()  => resolve(total));
        });
    });
};
