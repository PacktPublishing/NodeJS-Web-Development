'use strict';

var util = require('util');
var path = require('path');
var express = require('express');
var router = express.Router();
var notes = require(process.env.NOTES_MODEL ? path.join('..', process.env.NOTES_MODEL) : '../models/notes-memory');

const log   = require('debug')('notes:router-notes');
const error = require('debug')('notes:error');

const usersRouter = require('./users');

// Add Note. (create)
router.get('/add', usersRouter.ensureAuthenticated, (req, res, next) => {
    var user = req.user ? req.user : undefined;
    res.render('noteedit', {
        title: "Add a Note",
        docreate: true,
        notekey: "",
        note: undefined,
        user: user,
        breadcrumbs: [
            { href: '/', text: 'Home' },
            { active: true, text: "Add Note" }
        ],
        hideAddNote: true
    });
});

// Save Note (update)
router.post('/save', usersRouter.ensureAuthenticated, (req, res, next) => {
    var p;
    if (req.body.docreate === "create") {
        p = notes.create(req.body.notekey,
                req.body.title, req.body.body);
    } else {
        p = notes.update(req.body.notekey,
                req.body.title, req.body.body);
    }
    p.then(note => {
        res.redirect('/notes/view?key='+ req.body.notekey);
    })
    .catch(err => { next(err); });
});

// Read Note (read)
router.get('/view', (req, res, next) => {
    notes.read(req.query.key)
    .then(note => {
        var user = req.user ? req.user : undefined;
        res.render('noteview', {
            title: note ? note.title : "",
            notekey: req.query.key,
            note: note,
            user: user,
            breadcrumbs: [
                { href: '/', text: 'Home' },
                { active: true, text: note.title }
            ]
        });
    })
    .catch(err => { next(err); });
});

// Edit note (update)
router.get('/edit', usersRouter.ensureAuthenticated, (req, res, next) => {
    notes.read(req.query.key)
    .then(note => {
        var user = req.user ? req.user : undefined;
        res.render('noteedit', {
            title: note ? ("Edit " + note.title) : "Add a Note",
            docreate: false,
            notekey: req.query.key,
            note: note,
            hideAddNote: true,
            user: user,
            breadcrumbs: [
                { href: '/', text: 'Home' },
                { active: true, text: note.title }
            ]
        });
    })
    .catch(err => { next(err); });
});

// Ask to Delete note (destroy)
router.get('/destroy', usersRouter.ensureAuthenticated, (req, res, next) => {
    notes.read(req.query.key)
    .then(note => {
        var user = req.user ? req.user : undefined;
        res.render('notedestroy', {
            title: note ? note.title : "",
            notekey: req.query.key,
            note: note,
            user: user,
            breadcrumbs: [
                { href: '/', text: 'Home' },
                { active: true, text: 'Delete Note' }
            ]
        });
    })
    .catch(err => { next(err); });
});

// Really destroy note (destroy)
router.post('/destroy/confirm', usersRouter.ensureAuthenticated, (req, res, next) => {
    notes.destroy(req.body.notekey)
    .then(() => { res.redirect('/'); })
    .catch(err => { next(err); });
});

module.exports = router;
