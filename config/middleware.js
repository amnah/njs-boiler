
var path = require('path');
var config = require(path.join(__dirname, 'config'));

// -----------------------------------
// Middleware for routing in controllers
//   use in "controllers/*.js"
// -----------------------------------
/**
 * Ensure user is logged in. Set url to redirect after logging in
 */
exports.isLoggedIn = function (req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  req.flash('loginUrl', req.originalUrl);
  res.redirect('/login');
};

/**
 * Ensure user is logged out
 */
exports.isLoggedOut = function (req, res, next) {
  if (!req.isAuthenticated()) { return next(); }
  res.redirect('/');
};

// -----------------------------------
// Middleware for express app
//   use in "config/express.js"
// -----------------------------------
/**
 * Set session length for login based on "rememberme" in login form
 * Process for login page only (via POST)
 */
exports.rememberMe = function (req, res, next) {
  if ( req.method == 'POST' && req.url == '/login' ) {
    if ( req.body.rememberme ) {
      req.session.cookie.maxAge = config.rememberMeDuration;
    }
    else {
      req.session.cookie.expires = false;
    }
  }
  next();
};

/**
 * Ensure that site config and user variables are available in all views
 */
exports.responseLocalVariables = function (req, res, next) {
  res.locals.user = req.user;
  if (typeof config.site !== 'undefined') {
    res.locals.site = config.site;
  }
  next();
};

/**
 * Process fallback - display view file for 404 pages
 */
exports.notFound404 = function(req, res, next) {
  res.status(404).render('404', {
    url: req.originalUrl,
    error: 'Not found'
  });
};



