
var express = require('express');
var router = express.Router();
var config = require('../config/config');
var auth = require('../libraries/auth');
var passport = require('passport');
var User = require('../models/user');

/**
 * GET user
 */
router.get('/', function(req, res, next) {
  res.render('user/index', { title: 'User', user: req.user });
});

/**
 * GET logout
 */
router.get('/logout', function(req, res, next) {
  req.logout();
  res.redirect('/');
});

/**
 * GET login
 */
router.get('/login', auth.isLoggedOut, function(req, res, next){
  res.render('user/login', {
    title: 'Login',
    errors: req.flash('errors')[0],
    reqBody: req.flash('reqBody')[0]
  });
});

/**
 * POST login
 *   https://github.com/jaredhanson/passport-local/blob/master/examples/express3-mongoose-multiple-files/routes/user.js
 */
router.post('/login', auth.isLoggedOut, function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) {
      // set flash values for refilling form values and displaying errors
      req.flash('reqBody', req.body);
      req.flash('errors', info);
      return res.redirect('/user/login');
    }
    if (req.body.rememberme) {
      req.session.cookie.maxAge = config.rememberMeDuration;
    }
    else {
      req.session.cookie.expires = false;
    }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      var loginUrlCheck = req.flash('loginUrl');
      var loginUrl = (loginUrlCheck.length > 0) ? loginUrlCheck[0] : '/';
      return res.redirect(loginUrl);
    });
  })(req, res, next);
});

/**
 * GET register
 */
router.get('/register', auth.isLoggedOut, function(req, res, next){
  res.render('user/register', {
    title: 'Register',
    errors: req.flash('errors')[0],
    reqBody: req.flash('reqBody')[0]
  });
});

/**
 * POST register
 */
router.post('/register', auth.isLoggedOut, function(req, res, next) {
  var user = new User({
    email: req.body.email,
    username: req.body.username,
    password: req.body.password,
    provider: 'local'
  });
  user.setScenario('register').save(function(err){
    if (err) {
      // parse out save errors for duplicate email/username
      // http://nraj.tumblr.com/post/38706353543/handling-uniqueness-validation-in-mongo-mongoose
      if (err && (11000 === err.code || 11001 === err.code) && err.err.indexOf('email') > 0) {
        err.errors = { email: { message: '[' + req.body.email + '] has already been taken' } };
      }
      if (err && (11000 === err.code || 11001 === err.code) && err.err.indexOf('username') > 0) {
        err.errors = { username: { message: '[' + req.body.username + '] has already been taken' } };
      }
      // set flash values for refilling form values and displaying errors
      req.flash('reqBody', req.body);
      req.flash('errors', err.errors);
      return res.redirect('/user/register');
    }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect('/');
    });
  });
});


/**
 * GET facebook
 *   http://passportjs.org/guide/facebook/
 */
router.get('/auth/facebook', passport.authenticate('facebook', {
  scope: ['email', 'user_about_me']
}));

/**
 * GET twitter
 *   http://passportjs.org/guide/twitter/
 */
router.get('/auth/twitter', passport.authenticate('twitter'));

/**
 * GET facebook callback
 *   https://github.com/jaredhanson/passport-facebook/blob/master/examples/login/app.js
 */
router.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/' }),
  function(req, res, next) {
    res.redirect('/');
  }
);

/**
 * GET twitter callback
 *   https://github.com/jaredhanson/passport-twitter/blob/master/examples/signin/app.js
 */
router.get('/auth/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/' }),
  function(req, res, next) {
    res.redirect('/');
  }
);

module.exports = router;
