
module.exports.controller = function(app) {

  /**
   * GET home page
   */
  app.get('/', function(req, res) {
    res.render('home/index', { title: 'Home' });
  });

  /**
   * GET about page
   */
  app.get('/about', function(req, res) {
    res.render('home/about', { title: 'About' });
  });
};