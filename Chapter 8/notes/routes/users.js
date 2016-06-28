'use strict';

const util  = require('util');
const path  = require('path');

const log   = require('debug')('notes:router-users');
const error = require('debug')('notes:error');

const express  = require('express');
const router   = express.Router();

exports.router = router;

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;

const usersModel = require(process.env.USERS_MODEL ? path.join('..', process.env.USERS_MODEL) : '../models/users-rest');

exports.initPassport = function(app) {
  app.use(passport.initialize());
  app.use(passport.session());
};

exports.ensureAuthenticated = function(req, res, next) {
  // req.user is set by Passport in the deserialize function
  if (req.user) next();
  else res.redirect('/users/login');
};


router.get('/login', function(req, res, next) {
  // log(util.inspect(req));
  res.render('login', {
    title: "Login to Notes",
    user: req.user,
    // message: req.flash('error')
  });
});

router.post('/login',
  passport.authenticate('local', {
    successRedirect: '/',              // SUCCESS: Go to home page
    failureRedirect: 'login', // FAIL: Go to /user/login
    // failureFlash: true
  })
);

/* NOT USED
router.get('/login/fail', function(req, res, next) {
  res.send('Failed to authenticate');
});

router.get('/login/success', function(req, res, next) {
  res.send('Successfully authenticated');
}); */

router.get('/logout', function(req, res, next) {
  req.logout();
  res.redirect('/');
});

// Redirect the user to Twitter for authentication.  When complete, Twitter
// will redirect the user back to the application at
//   /auth/twitter/callback
router.get('/auth/twitter', passport.authenticate('twitter'));

// Twitter will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
router.get('/auth/twitter/callback',
  passport.authenticate('twitter', { successRedirect: '/',
                                     failureRedirect: '/users/login' }));

passport.use(new LocalStrategy(
  function(username, password, done) {
    log('pasport use username='+ username +' '+ password);
    usersModel.userPasswordCheck(username, password)
    .then(check => {
      if (check.check) {
        done(null, { id: check.username, username: check.username });
      } else {
        done(null, false, check.message);
      }
      return check;
    })
    .catch(err => done(err));
  }
));

passport.use(new TwitterStrategy({
    consumerKey: "V5oBDLJOGsC7QztZlRqAk8sI4",
    consumerSecret: "0Vc1HHUEY3a4YYYfNJDFHPOiljruKMTiecHYyAufxN2Mc0Gxbm",
    callbackURL: "http://MacBook-Pro-2.local:3000/users/auth/twitter/callback"
  },
  function(token, tokenSecret, profile, done) {
    log('TwitterStrategy '+ util.log(profile));
    usersModel.findOrCreate({
      id: profile.username, username: profile.username, password: "", provider: profile.provider,
      familyName: profile.displayName, givenName: "", middleName: "",
      photos: profile.photos, emails: profile.emails
    })
    .then(user => done(null, user))
    .catch(err => done(err));
  }
));

passport.serializeUser(function(user, done) {
  log('serializeUser '+ util.inspect(user));
  done(null, user.username);
});

passport.deserializeUser(function(username, done) {
  log('deserializeUser '+ username);
  usersModel.find(username)
  .then(user => {
    log('... found user '+ util.inspect(user));
    done(null, user);
  })
  .catch(err => done(err));
});
