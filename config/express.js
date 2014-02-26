
var express = require('express');
var path = require('path');
var swig = require('swig');
var flash = require('connect-flash');
var passport = require('passport');
var MongoStore = require('connect-mongo')(express);
var config = require('./config');

// note that middleware order is important!
// dont move things around unless you know what you're doing
var app = express();
app.engine('html', swig.renderFile);
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'html');
app.set('port', config.port);
app.use(express.compress());
app.use(express.favicon());
app.use(express.logger('production' === config.env ? '' : 'dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser(config.cookieSecret));
app.use(express.session({
  store: new MongoStore({
    url: config.db
  }, function () {
    console.log("MongoDB session initialized");
  })
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next) {
  // add user/site variables to all templates
  res.locals.user = req.user;
  res.locals.site = config.site;
  next();
});
app.use(app.router);
app.use(require('less-middleware')({ src: path.join(__dirname, '../public') }));
app.use(express.static(path.join(__dirname, '../public')));

// set up express behind nginx proxy
//   http://expressjs.com/guide.html#proxies
app.enable('trust proxy');

// -----------------------------------
// development env
// -----------------------------------
if ('development' === config.env) {
  // disable swig template cache
  app.set('view cache', false);
  swig.setDefaults({ cache: false });

  // use error handler
  app.use(express.errorHandler());
}
// -----------------------------------
// production env
// -----------------------------------
else if ('production' === config.env) {
  app.use(function(err, req, res, next){
    console.error(err);
    err.status = err.status || 500;
    res.status(err.status);
    var accept = req.headers.accept || '';
    if (~accept.indexOf('html')) {
      res.render('500', { err: err });
    }
    else if (~accept.indexOf('json')) {
      res.json({ error: { status: err.status, message: err.message } });
    }
    else {
      res.setHeader('Content-Type', 'text/plain');
      res.end(err.status + ' - ' + err.message);
    }
  });
}

// -----------------------------------
// set up last middleware for catching 404 pages
// -----------------------------------
app.use(function(req, res, next) {
  res.status(404).render('404', {
    url: req.originalUrl
  });
});

// export app
module.exports = app;