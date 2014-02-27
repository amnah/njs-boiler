
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// -----------------------------------
// Schema
//   set email and username as sparse - this is to allow null values for
//   social registrations
// -----------------------------------
var userSchema = new mongoose.Schema({
  email: { type: String, trim: true, unique: true, sparse: true },
  username: { type: String, trim: true, unique: true, sparse: true },
  profile: {
    name: { type: String, trim: true }
  },
  password: String,
  provider: {
    type: String,
    enum: ['local', 'facebook', 'twitter']
  },
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
  return value.match(/^(?:[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+\.)*[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+@(?:(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!\.)){0,61}[a-zA-Z0-9]?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!$)){0,61}[a-zA-Z0-9]?)|(?:\[(?:(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\.){3}(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\]))$/);
};
var validateAlphanumericUnderscore = function(value) {
  return value.match(/^[a-zA-Z0-9_.]+$/);
};
var validatePasswordLength = function(value) {
  return value.length >= 3;
};

// set validators
userSchema.path('email').validate(validateRequired, 'Email is required');
userSchema.path('email').validate(validateEmail, 'Invalid email');
userSchema.path('username').validate(validateRequired, 'Username is required');
userSchema.path('username').validate(validateAlphanumericUnderscore, 'Username must be alphanumeric, ".", or "_"');
userSchema.path('password').validate(validateRequired, 'Password is required');
userSchema.path('password').validate(validatePasswordLength, 'Password not long enough');

// set pre-save hook
userSchema.pre('save', function preSave(next) {
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
userSchema.methods.encryptPassword = function(inputPassword) {
  var salt = bcrypt.genSaltSync(12);
  return hash = bcrypt.hashSync(inputPassword, salt);
};

/**
 * Verify password
 */
userSchema.methods.verifyPassword = function(checkPassword) {
  return this.password && bcrypt.compareSync(checkPassword, this.password);
};

/**
 * Set scenarios to prep for validation
 */
userSchema.methods.setScenario = function(scenario) {
  // prepare for register
  if (scenario === 'register') {
    // ensure that the fields are set so that they go through validation
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
userSchema.methods.displayName = function() {
  return this.email ? this.email : this.username;
};

// -----------------------------------
// Model and export
// -----------------------------------
var User = mongoose.model('User', userSchema);
module.exports = User;