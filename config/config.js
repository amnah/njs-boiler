
// determine environment config
var env = process.env.NODE_ENV || 'development';
var port = process.env.PORT || 3000;

// set standard config
var config = {
  env: env,
  port: port,
  db: 'mongodb://localhost/dev',
  cookieSecret: 'your secret here',
  rememberMeDuration: 2592000000, // 30*24*60*60*1000 Rememeber 'me' for 30 days (milliseconds i guess)

  // facebook config
  // comment these out if you don't want facebook authentication
  facebook: {
    clientID:    'xxx',
    clientSecret: 'yyy',
    callbackURL: 'http://localhost:3000/auth/facebook/callback'
  },

  // twitter config
  // comment these out if you don't want twitter authentication
  twitter: {
    consumerKey: 'xxx',
    consumerSecret: 'yyy',
    callbackURL: 'http://localhost:3000/auth/twitter/callback'
  },

  // example site config
  // these variables will be available in all views, e.g., {{ site.title }}
  site: {
    title: 'My Website',
    author: 'author',
    description: 'my description'
  }
};

// override config based on environment
if (env === 'production') {
  config.db = 'mongodb://localhost/prod';
}

// export module
module.exports = config;