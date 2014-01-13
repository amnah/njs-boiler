
var path = require('path');
var passport = require('passport');
var middleware = require(path.join(__dirname, '../config/middleware'));
var User = require('../models/user');

module.exports.controller = function(app) {

  /**
   * GET user (account)
   */
  app.get('/user', middleware.isLoggedIn, function(req, res) {
    res.render('user/index', { title: 'User', user: req.user });
  });

  /**
   * GET logout
   */
  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  /**
   * GET login
   */
  app.get('/login', middleware.isLoggedOut, function(req, res){
    res.render('user/login', {
      title: 'Login',
      errors: req.flash('errors')[0],
      reqBody: req.flash('reqBody')[0]
    });
  });

  /**
   * POST login
   * https://github.com/jaredhanson/passport-local/blob/master/examples/express3-mongoose-multiple-files/routes/user.js
   */
  app.post('/login', middleware.isLoggedOut, function(req, res, next) {
    // use passport authentication
    passport.authenticate('local', function(err, user, info) {
      if (err) { return next(err); }
      if (!user) {
        // set flash values for refilling form values and displaying errors
        req.flash('reqBody', req.body);
        req.flash('errors', info);
        return res.redirect('/login');
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
  app.get('/register', middleware.isLoggedOut, function(req, res){
    res.render('user/register', {
      title: 'Register',
      errors: req.flash('errors')[0],
      reqBody: req.flash('reqBody')[0]
    });
  });

  /**
   * POST register
   */
  app.post('/register', middleware.isLoggedOut, function(req, res, next) {
    var user = new User({
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
      provider: 'local'
    });
    user.setScenario('register').save(function(err){
      if (err) {
        // parse out save errors for duplicate email/username
        if (err && (11000 === err.code || 11001 === err.code) && err.err.indexOf('email') > 0) {
          err.errors = { email: { message: '[' + req.body.email + '] has already been taken' } };
        }
        if (err && (11000 === err.code || 11001 === err.code) && err.err.indexOf('username') > 0) {
          err.errors = { username: { message: '[' + req.body.username + '] has already been taken' } };
        }
        // set flash values for refilling form values and displaying errors
        req.flash('reqBody', req.body);
        req.flash('errors', err.errors);
        return res.redirect('/register');
      }
      req.logIn(user, function(err) {
        if (err) { return next(err); }
        return res.redirect('/');
      });
    });
  });
};