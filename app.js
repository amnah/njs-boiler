
var path = require('path');
var fs = require('fs');
var http = require('http');

// get config
// (environment is based on NODE_ENV, or can be calculated in the config file itself)
var config = require(path.join(__dirname, 'config/config'));

// set up express app
var app = require(path.join(__dirname, 'config/express'));

// add controllers/routes
//   http://timstermatic.github.io/blog/2013/08/17/a-simple-mvc-framework-with-node-and-express/
var controllerPath = path.join(__dirname, 'controllers');
fs.readdirSync(controllerPath).forEach(function (file) {
  if (file.substr(-3) === '.js') {
    route = require(controllerPath + '/' + file);
    route.controller(app);
  }
});

// set up passport authentication
require(path.join(__dirname, 'config/passport'));

// connect to db
require('mongoose').connect(config.db);

// create server
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
  console.log('Using config: ');
  console.log(config);
});