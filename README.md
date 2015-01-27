Node.js Boiler
==========

### [Demo](http://njs-boiler.herokuapp.com/)

This boilerplate was built for PHP developers who wish to try out Node.js.
That is, the structure and style of this app are very similar to that of the
popular PHP MVC frameworks.

It is a basic app with a home, about, and user pages. It uses MongoDB/Mongoose
for the data layer, Swig for the views, and passport for user authentication.

It was heavily inspired by [nodejs-passport-boilerplate]
(https://github.com/diki/nodejs-passport-boilerplate).

### Features
* MVC application built on Express
* Controller files
    * Routes defined in controllers
* MongoDB/Mongoose
    * Schema and validation for User model
* Swig template (instead of jade)
    * Similar syntax to PHP
* Passport for user authentication
    * User login/registration
    * Facebook integration
    * Twitter integration
* MongoDB session store via connect-mongo
* Flash messages via connect-flash

### Installation
1. ```git clone https://github.com/amnah/njs-boiler myappname```
2. ```cd myappname && npm install```
3. ```nano config/config.js``` (modify as desired)
4. ```DEBUG=app node bin/www```
5. Open up browser to ```http://localhost:3000```
6. *Optional* - Specify different environments ```NODE_ENV=production DEBUG=app node bin/www```
7. *Optional* - Add indexes for facebook/twitter id

```javascript
db.users.ensureIndex({"facebook.id":1})
db.users.ensureIndex({"twitter.id_str":1})
```

### Good reads
* [Express](http://expressjs.com/)
* [Mongoose guide](http://mongoosejs.com/docs/guide.html)
* [Swig syntax](http://paularmstrong.github.io/swig/docs/#variables)
* [Passport guide](http://passportjs.org/guide)