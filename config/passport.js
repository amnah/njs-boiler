
var path = require('path');
var config = require(path.join(__dirname, 'config'));
var User = require('../models/user');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;

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
 *   use in "controllers/user.js" in "app.post('/login', ...)"
 */
passport.use(new LocalStrategy({
    usernameField: 'login',
    passwordField: 'password'
  },
  function(login, password, done) {
    // set condition for email login only, or email+username login
    //var condition = { email: login };
    var condition = { $or: [ { email: login }, { username: login} ] };
    User.findOne(condition, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { loginErrorMessage: 'Email/username not found' });
      }
      /* Uncomment this is you want to inform users about social logins
      if (!user.password) {
        return done(null, false, { passwordErrorMessage: 'No password set. Social login?' });
      }
      */
      if (!user.verifyPassword(password)) {
        return done(null, false, { passwordErrorMessage: 'Incorrect password' });
      }
      return done(null, user);
    });
  }
));

/**
 * Facebook strategy. Logic is:
 * 1) Check for user who has the facebook id -> simply return that user
 * 2) Check for user who has the facebook email -> link that user to the facebook profile
 * 3) Create new user. In this case, check for another user who may have the username
 *    already -> fill "username" field with placeholder to prevent conflict
 *
 *   http://passportjs.org/guide/facebook/
 *   use in "controllers/user.js" in "app.post('/auth/facebook/callback', ...)"
 */
if (config.facebook) {
  passport.use(new FacebookStrategy(config.facebook, function(accessToken, refreshToken, profile, done) {

    // attempt to find user based on facebook id
    User.findOne({ 'facebook.id': profile.id }, function (err, user) {
      if (err) { return done(err); }
      if (user) { return done(err, user); }

      // try to link existing user via email
      User.findOne({ email: profile.emails[0].value }, function (err, userEmailCheck) {
        if (err) { return done(err); }

        // link existing user if found, or create new one
        if (userEmailCheck) {
          user = userEmailCheck;
          user.facebook = profile._json;
        }
        else {
          user = new User({
            email: profile.emails[0].value,
            username: profile.username,
            name: profile.displayName,
            provider: 'facebook',
            facebook: profile._json
          });
        }

        // check username and save document
        checkUsernameAndSave(user, 'facebook_' + profile.id, done);
      });
    });
  }));
}

/**
 * Twitter strategy. Logic is:
 * 1) Check for user who has the twitter id -> simply return that user
 * 2) Create new user. In this case, check for another user who may have the username
 *    already -> fill "username" field with placeholder to prevent conflict
 *
 *   http://passportjs.org/guide/facebook/
 *   use in "controllers/user.js" in "app.post('/auth/facebook/callback', ...)"
 */
if (config.twitter) {
  passport.use(new TwitterStrategy(config.twitter, function(token, tokenSecret, profile, done) {

    // attempt to find user based on twitter id
    User.findOne({ 'twitter.id_str': profile.id }, function (err, user) {
      if (err) { return done(err); }
      if (user) { return done(err, user); }

      // create new user, check username, and save
      user = new User({
        username: profile.username,
        name: profile.displayName,
        provider: 'twitter',
        twitter: profile._json
      });
      checkUsernameAndSave(user, 'twitter_' + profile.id, done);
    });
  }));
}

// -----------------------------------
// Helper functions
// -----------------------------------
/**
 * Check if the username already exists
 * If so, replace with alternateName
 * Save afterwards
 */
function checkUsernameAndSave(user, alternateName, done) {

  // check for a user document with the username but a different id (=duplicate)
  var condition = { username: user.username, _id: { "$ne": user._id } };
  User.findOne(condition, function (err, userUsernameCheck) {

    // return error
    if (err) { return done(err); }

    // set placeholder username
    if (userUsernameCheck) {
      user.username = alternateName;
    }

    // save
    user.save(function (err) {
      if (err) { return done(err); }
      return done(err, user);
    });
  });
}