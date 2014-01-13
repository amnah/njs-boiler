
var User = require('../models/user');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

// -----------------------------------
// Persistent login sessions
// -----------------------------------
passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

// -----------------------------------
// Passport strategies
// -----------------------------------
/**
 * Local strategy
 *   http://passportjs.org/guide/username-password/
 */
passport.use(new LocalStrategy({
    usernameField: 'login',
    passwordField: 'password'
  },
  function(login, password, done) {
    //var condition = { email: login }; // email only
    var condition = { $or: [ { email: login }, { username: login} ] }; // email or username
    User.findOne(condition, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { loginErrorMessage: 'Email/username not found' });
      }
      if (!user.verifyPassword(password)) {
        return done(null, false, { passwordErrorMessage: 'Incorrect password' });
      }
      return done(null, user);
    });
  }
));