'use strict';

const EventEmitter = require('events');
const util         = require('util');

const log   = require('debug')('notes:router-events');
const error = require('debug')('notes:error');

class NotesEmitter extends EventEmitter {}

module.exports = new NotesEmitter();

module.exports.noteCreated = function(note) {
    log('noteCreated '+ util.inspect(note));
    module.exports.emit('notecreated', note);
};

module.exports.noteUpdate = function(note) {
    log('noteUpdate '+ util.inspect(note));
    module.exports.emit('noteupdate', note);
};

module.exports.noteDestroy = function(data) {
    log('noteDestroy '+ util.inspect(data));
    module.exports.emit('notedestroy', data);
};
