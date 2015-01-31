
// determine environment config
var env = process.env.NODE_ENV || 'development';
var port = process.env.PORT || 3000;

// set standard config
var config = {
  env: env,
  port: port,
  db: 'mongodb://localhost/dev',
  cookieParserSecret: 'xxx',
  mongoSessionSecret: 'yyy',
  rememberMeDuration: 30*24*60*60*1000, // 'remember me' for 30 days (milliseconds)

  // site config
  // these variables will be available in all views, e.g., {{ site.title }}
  site: {
    title: 'My Website',
    author: 'Author',
    description: 'My Description'
  }

  // uncomment these if you want social auth
  // dont forget the comma above ^^^

  /*
  // facebook config
  facebook: {
    clientID:    'xxx',
    clientSecret: 'yyy',
    callbackURL: 'http://localhost:3000/auth/facebook/callback'
  },

  // twitter config
  twitter: {
    consumerKey: 'xxx',
    consumerSecret: 'yyy',
    callbackURL: 'http://localhost:3000/auth/twitter/callback'
  }
  */
};

// override config based on environment
if (env === 'development') {
  config.site.title = config.site.title + ' (Dev)';
}
else if (env === 'production') {
  config.db = 'mongodb://localhost/prod';
  config.cookieParserSecret = 'xxxx';
  config.mongoSessionSecret = 'yyyy';
}

// export module
module.exports = config;