
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// -----------------------------------
// Schema
//   set email and username as sparse - this is to allow null values for
//   social registrations
// -----------------------------------
var schema = new mongoose.Schema({
  email: { type: String, trim: true, unique: true, sparse: true },
  username: { type: String, trim: true, unique: true, sparse: true },
  profile: {
    name: { type: String, trim: true }
  },
  password: String,
  provider: { type: String, enum: ['local', 'facebook', 'twitter'] },
  facebook: {},
  twitter: {}
});

// -----------------------------------
// Validators
//   note that we dont validate uniqueness here. that is handled in the controller
//   http://nraj.tumblr.com/post/38706353543/handling-uniqueness-validation-in-mongo-mongoose
//   https://groups.google.com/forum/?fromgroups=#!topic/mongoose-orm/BX7kz0BwLjk
// -----------------------------------
// define validation functions
var validateRequired = function(value) {
  return (value && value.length);
};
var validateEmail = function(value) {
  // taken from https://github.com/chriso/validator.js
  return value.match(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i);
};
var validateAlphanumericDotUnderscore = function(value) {
  return value.match(/^[a-zA-Z0-9_.]+$/);
};
var validatePasswordLength = function(value) {
  return value.length >= 3;
};

// set validators
schema.path('email').validate(validateRequired, 'Email is required');
schema.path('email').validate(validateEmail, 'Invalid email');
schema.path('username').validate(validateRequired, 'Username is required');
schema.path('username').validate(validateAlphanumericDotUnderscore, 'Username must be alphanumeric, ".", or "_"');
schema.path('password').validate(validateRequired, 'Password is required');
schema.path('password').validate(validatePasswordLength, 'Password not long enough');

// set pre-save hook
schema.pre('save', function (next) {
  // hash password
  if (this.isModified('password')) {
    this.password = this.encryptPassword(this.password);
  }
  next();
});

// -----------------------------------
// Methods
// -----------------------------------
/**
 * Encrypt password
 */
schema.methods.encryptPassword = function(inputPassword) {
  var salt = bcrypt.genSaltSync(13);
  return bcrypt.hashSync(inputPassword, salt);
};

/**
 * Verify password
 */
schema.methods.verifyPassword = function(checkPassword) {
  return this.password && bcrypt.compareSync(checkPassword, this.password);
};

/**
 * Set scenarios to prep for validation
 */
schema.methods.setScenario = function(scenario) {
  // prepare for register
  if (scenario === 'register') {
    // ensure that the fields are set (aka, not null) so that they go through validation properly
    // this is needed because registrations via social apps may not have these fields
    var fields = ['email', 'username', 'password'];
    for (var i = 0; i < fields.length; i++) {
      this[fields[i]] = this[fields[i]] ? this[fields[i]] : '';
    }
  }
  return this;
};

/**
 * Displays user's email or username (because email can be blank)
 */
schema.methods.displayName = function() {
  return this.email ? this.email : this.username;
};

// -----------------------------------
// Model and export
// -----------------------------------
var User = mongoose.model('User', schema);
module.exports = User;