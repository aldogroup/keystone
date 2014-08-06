var keystone = require('../../'),
    config = require('config');

exports = module.exports = function(req, res) {
  config.keystone.mongo = 'mongodb://localhost/keystone_' + req.params.locale;

  keystone.init(config.keystone);
  keystone.httpServer.close();

  keystone.mongoose.connection.close();
  keystone.mongoose.connect(config.keystone.mongo);
  keystone.mongoose.connection.on('error', function(err) {
    if (keystone.get('logger')) {
      console.log('------------------------------------------------');
      console.log('Mongo Error:\n');
      console.log(err);
        throw new Error("Mongo Error");
      }
  });
  res.redirect(req.headers.referer);
};
