
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var swig = require('swig');
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var config = require('./config/config');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger(config.env === 'production' ? 'combined' : 'dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser(config.cookieParserSecret));
app.use(flash());
app.use(session({
  secret: config.mongoSessionSecret,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({
    url: config.db
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.enable('trust proxy');

// connect to mongodb
mongoose.connect(config.db);

// add user/site variables to all templates
app.use(function(req, res, next) {
  // add user/site variables to all templates
  res.locals.user = req.user;
  res.locals.site = config.site;
  next();
});

// add controllers/routes
//   index.js -> '/'
//   other.js -> '/other
// @see http://timstermatic.github.io/blog/2013/08/17/a-simple-mvc-framework-with-node-and-express/
var controllerPath = path.join(__dirname, 'controllers');
fs.readdirSync(controllerPath).forEach(function (file) {
  if (file.substr(-3) === '.js') {
    file = file.replace('.js', '');
    var route     = '/' + (file == 'index' ? '' : file);
    var routePath = path.join(controllerPath, file);
    app.use(route, require(routePath));
  }
});

// handle 404
app.use(function(req, res, next) {
  res.status(404).render('404', {
    url: req.originalUrl
  });
});

// handle errors
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('500', {
    status: err.status,
    message: err.message,
    stack: config.env === 'development' ? err.stack : ''
  });
});

// handle different environments
if (config.env === 'development') {
  // disable swig cache
  app.set('view cache', false);
  swig.setDefaults({ cache: false });
}
else if (config.env === 'production') {
  // something
}

module.exports = app;
