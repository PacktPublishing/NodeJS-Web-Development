'use strict';

const fs    = require('fs-extra');
const path  = require('path');
const util  = require('util');

const log   = require('debug')('notes:fs-model');
const error = require('debug')('notes:error');

const Note = require('./Note');

function notesDir() {
    const dir = process.env.NOTES_FS_DIR || "notes-fs-data";
    return new Promise((resolve, reject) => {
        fs.ensureDir(dir, err => {
            if (err) reject(err);
            else resolve(dir);
        });
    });
}

function filePath(notesdir, key) {
    return path.join(notesdir, key + ".json");
}

function readJSON(notesdir, key) {
    const readFrom = filePath(notesdir, key);
    return new Promise((resolve, reject) => {
        fs.readFile(readFrom, 'utf8', (err, data) => {
            if (err) return reject(err);
            log('readJSON '+ data);
            resolve(Note.fromJSON(data));
        });
    });
}

exports.update = exports.create = function(key, title, body) {
    return notesDir().then(notesdir => {
        if (key.indexOf('/') >= 0) throw new Error(`key ${key} cannot contain '/'`);
        var note = new Note(key, title, body);
        const writeTo = filePath(notesdir, key);
        const writeJSON = note.JSON;
        log('WRITE '+ writeTo +' '+ writeJSON);
        return new Promise((resolve, reject) => {
            fs.writeFile(writeTo, writeJSON, 'utf8', err => {
                if (err) reject(err);
                else resolve(note);
            });
        });
    });
};

exports.read = function(key) {
    return notesDir().then(notesdir => {
        return readJSON(notesdir, key).then(thenote => {
            log('READ '+ notesdir +'/'+ key +' '+ util.inspect(thenote));
            return thenote;
        });
    });
};

exports.destroy = function(key) {
    return notesDir().then(notesdir => {
        return new Promise((resolve, reject) => {
            fs.unlink(filePath(notesdir, key), err => {
                if (err) reject(err);
                else resolve();
            });
        });
    });
};

exports.keylist = function() {
    return notesDir().then(notesdir => {
        return new Promise((resolve, reject) => {
            fs.readdir(notesdir, (err, filez) => {
                if (err) return reject(err);
                if (!filez) filez = [];
                resolve({ notesdir, filez });
            });
        });
    })
    .then(data => {
        log('keylist dir='+ data.notesdir +' files='+ util.inspect(data.filez));
        var thenotes = data.filez.map(fname => {
            var key = path.basename(fname, '.json');
            log('About to READ '+ key);
            return readJSON(data.notesdir, key).then(thenote => {
                return thenote.key;
            });
        });
        return Promise.all(thenotes);
    });
};

exports.count   = function()    {
    return notesDir().then(notesdir => {
        return new Promise((resolve, reject) => {
            fs.readdir(notesdir, (err, filez) => {
                if (err) return reject(err);
                resolve(filez.length);
            });
        });
    });
};
