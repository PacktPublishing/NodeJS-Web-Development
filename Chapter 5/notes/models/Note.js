'use strict';

module.exports = class Note {
    constructor(key, title, body) {
        this.key = key;
        this.title = title;
        this.body = body;
    }
};