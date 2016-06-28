'use strict';

const util = require('util');
const path = require('path');
const express = require('express');
const router = express.Router();
const notes = require(process.env.NOTES_MODEL ? path.join('..', process.env.NOTES_MODEL) : '../models/notes-memory');

const log   = require('debug')('notes:router-notes');
const error = require('debug')('notes:error');

const usersRouter = require('./users');

const messagesModel = require('../models/messages-sequelize');

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

router.post('/make-comment', usersRouter.ensureAuthenticated, (req, res, next) => {
    // log(util.inspect(req.body));
    messagesModel.postMessage(req.body.from, req.body.namespace, req.body.message)
    .then(results => { res.status(200).json({ }); })
    .catch(err => { res.status(500).end(err.stack); });
});

router.post('/del-message', usersRouter.ensureAuthenticated, (req, res, next) => {
    // log(util.inspect(req.body));
    log('/del-message');
    messagesModel.destroyMessage(req.body.id, req.body.namespace)
    .then(results => { log('SUCCESS /del-message'); res.status(200).json({ }); })
    .catch(err => { error('/del-message '+ err.stack); res.status(500).end(err.stack); });
});

module.exports = router;

module.exports.socketio = function(io) {
    
    var nspView = io.of('/view');
    nspView.on('connection', function(socket) {
        // 'cb' is a function sent from the browser, to which we
        // send the messages for the named note.
        log(`/view connected on ${socket.id}`);
        socket.on('getnotemessages', (namespace, cb) => {
            log('getnotemessages ' + namespace);
            messagesModel.recentMessages(namespace)
            .then(cb)
            .catch(err => console.error(err.stack));
        });
    });

    var forNoteViewClients = function(cb) {
        nspView.clients((err, clients) => {
            clients.forEach(id => {
                cb(nspView.connected[id]);
            });
        });
    };

    messagesModel.on('newmessage',  newmsg => {
        forNoteViewClients(socket => { socket.emit('newmessage', newmsg); });
    });
    messagesModel.on('destroymessage',  data => {
        forNoteViewClients(socket => { socket.emit('destroymessage', data); });
    });
    
    notes.events.on('noteupdate',  newnote => {
        forNoteViewClients(socket => { socket.emit('noteupdate', newnote); });
    });
    notes.events.on('notedestroy', data => {
        forNoteViewClients(socket => { socket.emit('notedestroy', data); });
        messagesModel.destroyMessages('/view-'+ data.key)
        .catch(err => console.error(err.stack));
    });
};

