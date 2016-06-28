'use strict';

const restify = require('restify');
const util    = require('util');

const log   = require('debug')('users:server');
const error = require('debug')('users:error');

const usersModel = require('./users-sequelize');

var server = restify.createServer({
    name: "User-Auth-Service",
    version: "0.0.1"
});

server.use(restify.authorizationParser());
server.use(check);
server.use(restify.queryParser());
server.use(restify.bodyParser({
    mapParams: true
}));

// Create a user record
server.post('/create-user', (req, res, next) => {
    usersModel.create(req.params.username, req.params.password,  req.params.provider,
                      req.params.familyName, req.params.givenName, req.params.middleName,
                      req.params.emails,   req.params.photos)
    .then(result => {
        // log('created '+ util.inspect(result));
        res.send(result);
        next(false);
    })
    .catch(err => { res.send(500, err); error(err.stack); next(false); });
});

// Update an existing user record
server.post('/update-user/:username', (req, res, next) => {
    usersModel.update(req.params.username, req.params.password,  req.params.provider,
                      req.params.familyName, req.params.givenName, req.params.middleName,
                      req.params.emails,   req.params.photos)
    .then(foo => {
        // log('updated '+ util.inspect(result));
        res.send(result);
        next(false);
    })
    .catch(err => { res.send(500, err); error(err.stack); next(false); });
});

// Find a user, if not found create one given profile information
server.post('/find-or-create', (req, res, next) => {
    log('find-or-create '+ util.inspect(req.params));
    usersModel.findOrCreate({
        id: req.params.username, username: req.params.username,
        password: req.params.password, provider: req.params.provider,
        familyName: req.params.familyName, givenName: req.params.givenName,
        middleName: req.params.middleName,
        emails: req.params.emails, photos: req.params.photos
    })
    .then(result => {
        // log('created '+ util.inspect(result));
        res.send(result);
        next(false);
    })
    .catch(err => { res.send(500, err); error(err.stack); next(false); });
});

// Find the user data (does not return password)
server.get('/find/:username', (req, res, next) => {
    usersModel.find(req.params.username).then(user => {
        if (!user) {
            res.send(404, new Error("Did not find "+ req.params.username));
        } else {
            res.send(user);
        }
        next(false);
    })
    .catch(err => { res.send(500, err); error(err.stack); next(false); });
});

// Determine if the user exists
server.get('/exists/:username', (req, res, next) => {
    usersModel.find(req.params.username).then(user => {
        if (!user) {
            res.send({ exists: false, username, message: "Did not find "+ req.params.username });
        } else {
            res.send({ exists: true, username });
        }
        next(false);
    })
    .catch(err => {
        res.send(500, { exists: false, username, message: err.stack });
        error(err.stack);
        next(false);
    });
});

// Delete/destroy a user record
server.del('/destroy/:username', (req, res, next) => {
    usersModel.destroy(req.params.username)
    .then(() => res.send({}) )
    .catch(err => { res.send(500, err); error(err.stack); next(false); });
});

// Check password
server.post('/passwordCheck', (req, res, next) => {
    usersModel.userPasswordCheck(req.params.username, req.params.password)
    .then(check => { res.send(check); next(false); })
    .catch(err => { res.send(500, err); error(err.stack); next(false); });
});

// List users
server.get('/list', (req, res, next) => {
    usersModel.listUsers().then(userlist => {
        if (!userlist) userlist = [];
        log(util.inspect(userlist));
        res.send(userlist);
        next(false);
    })
    .catch(err => { res.send(500, err); error(err.stack); next(false); });
});

server.listen(process.env.PORT, process.env.REST_LISTEN ? process.env.REST_LISTEN : "localhost", function() {
  log(server.name +' listening at '+ server.url);
});

// Mimic API Key authentication.

var apiKeys = [ { user: 'them', key: 'D4ED43C0-8BD6-4FE2-B358-7C0E230D11EF' } ];

function check(req, res, next) {
    log('check');
    if (req.authorization) {
        var found = false;
        for (let auth of apiKeys) {
            if (auth.key  === req.authorization.basic.password
             && auth.user === req.authorization.basic.username) {
                found = true;
                break;
            }
        }
        if (found) next();
        else {
            res.send(401, new Error("Not authenticated"));
            error('Failed authentication check '+ util.inspect(req.authorization));
            next(false);
        }
    } else {
        res.send(500, new Error('No Authorization Key'));
        error('NO AUTHORIZATION');
        next(false);
    }
}
