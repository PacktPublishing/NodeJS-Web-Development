'use strict';

const sqlite3 = require('sqlite3');

const log     = require('debug')('notes:sqlite3-utils');
const error   = require('debug')('notes:error');

exports.db = undefined;

exports.connectDB = function() {
    return new Promise((resolve, reject) => {
        if (exports.db) return resolve(exports.db);
        var dbfile = process.env.SQLITE_FILE || "notes.sqlite3";
        exports.db = new sqlite3.Database(dbfile,
            sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
            err => {
                if (err) reject(err);
                else {
                    log('Opened SQLite3 database '+ dbfile);
                    resolve(exports.db);
                }
            });
    });
};
