'use strict';

const util      = require('util');
const fs        = require('fs-extra');
const jsyaml    = require('js-yaml');
const Sequelize = require("sequelize");

const log     = require('debug')('notes:sequelize-model');
const error   = require('debug')('notes:error');

const Note    = require('./Note');

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
    });
};

exports.update = function(key, title, body) {
    return exports.connectDB()
    .then(SQNote => {
        return SQNote.find({ where: { notekey: key } })
        .then(note => {
            if (!note) {
                throw new Error("No note found for key " + key);
            } else {
                return note.updateAttributes({
                    title: title,
                    body: body
                });
            }
        });
    });
};

exports.read = function(key) {
    return exports.connectDB()
    .then(SQNote => {
        return SQNote.find({ where: { notekey: key } })
        .then(note => {
            if (!note) {
                throw new Error("No note found for " + key);
            } else {
                return new Note(note.notekey, note.title, note.body);
            }
        });
    });
};

exports.destroy = function(key) {
    return exports.connectDB()
    .then(SQNote => {
        return SQNote.find({ where: { notekey: key } })
        .then(note => {
            return note.destroy();
        });
    });
};

exports.keylist = function() {
    return exports.connectDB()
    .then(SQNote => {
        return SQNote.findAll({ attributes: [ 'notekey' ] })
        .then(notes => {
            return notes.map(note => note.notekey);
        });
    });
};

exports.count = function() {
    return exports.connectDB()
    .then(SQNote => {
        return SQNote.count()
        .then(count => {
            log('COUNT '+ count);
            return count;
        });
    });
};

