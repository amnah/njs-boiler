
var express = require('express');
var path = require('path');
var swig = require('swig');
var flash = require('connect-flash');
var passport = require('passport');
var MongoStore = require('connect-mongo')(express);
var config = require('./config');
var middleware = require('./middleware');

// create express app
//   note that middleware order is important!
//   dont move things around unless you know what you're doing
var app = express();
app.engine('html', swig.renderFile);
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'html');
app.set('port', config.port);
app.use(express.compress());
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser(config.cookieSecret));
app.use(express.session({
  store: new MongoStore({
    url: config.db
  })
}));
app.use(flash());
app.use(middleware.rememberMe);
app.use(passport.initialize());
app.use(passport.session());
app.use(middleware.responseLocalVariables);
app.use(app.router);
app.use(require('less-middleware')({ src: path.join(__dirname, '../public') }));
app.use(express.static(path.join(__dirname, '../public')));

// set up environment app based on environment
if ('development' === config.env) {
  // disable swig template cache
  app.set('view cache', false);
  swig.setDefaults({ cache: false });

  // use error handler
  app.use(express.errorHandler());
}
else if ('production' === config.env) {
  // something here
}

// set up last middleware for catching 404 pages
app.use(middleware.notFound404);

// export app
module.exports = app;