'use strict';

const fs      = require('fs');
const sqlite3Utils = require('./sqlite3-utils');

sqlite3Utils.connectDB()
.then(db => {
    return new Promise((resolve, reject) => {
        fs.readFile(process.argv[2], 'utf8', (err, sql) => {
            if (err) reject(err);
            else resolve({ db: db, sql: sql });
        });
    });
})
.then(data => {
    return new Promise((resolve, reject) => {
        data.db.exec(data.sql, err => {
            if (err) reject(err);
            else resolve();
        });
    });
})
.catch(err => { console.error(err); });