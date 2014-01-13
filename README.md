Node.js Boiler
==========

This boilerplate was built for PHP developers who wish to try out Node.js. That
is, the structure and style of this app is very similar to that of the
numerous MVC frameworks.

It contains packages that provide similar configuration and functionality to PHP,
 and it has user authentication built in.

It was heavily inspired by [nodejs-passport-boilerplate]
(https://github.com/diki/nodejs-passport-boilerplate)

### Demo

[See here](http://njs.amnahdev.com)

### Features
* Built on Express
* MVC structure
    * Routes defined in controllers
* Passport for user authentication
    * User login/registration
* Mongodb/Mongoose
    * Proper validation for User model
* Swig template for finer control in views
* LESS for compiling CSS

### Installation
1) ```git clone https://github.com/amnah/njs-boiler myappname```
2) ```cd myappname && npm install```
3) ```nano config/config.js``` modify as desired
4) ```node app.js```
5) ```NODE_ENV=production node app.js``` for specifying different environment
