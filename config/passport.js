
var path = require('path');
var config = require(path.join(__dirname, 'config'));
var User = require('../models/user');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

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
passport.use(new FacebookStrategy({
    clientID: config.facebookAppId,
    clientSecret: config.facebookAppSecret,
    callbackURL: config.facebookCallbackUrl
  },
  function(accessToken, refreshToken, profile, done) {

    // attempt to find user based on facebook id
    User.findOne({ 'facebook.id': profile.id }, function (err, user) {

      // return error
      if (err) { return done(err); }

      // return user directly if found
      if (user) { return done(err, user); }

      // try to find a user with the email
      User.findOne({ email: profile.emails[0].value }, function (err, userEmailCheck) {

        // return error
        if (err) { return done(err); }

        // use the found user or create new one
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

        // double-check that no one else has that username
        // note that we use "user.username" instead of "profile.username" because the user may have
        //   a valid username already. in that case, it will not find a conflict
        var condition = { username: user.username, _id: { "$ne": user._id } };
        User.findOne(condition, function (err, userUsernameCheck) {

          // return error
          if (err) { return done(err); }

          // set a placeholder username
          if (userUsernameCheck) {
            user.username = 'facebook_' + profile.id;
          }

          // save (FINALLY)
          user.save(function (err) {
            if (err) { return done(err); }
            return done(err, user);
          })

        }); // end find username
      }); // end find email
    }); // end find facebook id
  } // end function(accessToken, refreshToken, profile, done)
));