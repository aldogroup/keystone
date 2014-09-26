var keystone = require('../../'),
    config = require('config'),
    async = require('async');

exports = module.exports = function(req, res) {
  config.current_locale = req.params.locale;

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

  async.forEach(Object.keys(keystone.lists), function(key, callback) {
    var list = keystone.lists[key];

    async.forEach(Object.keys(list.fields),function(key, _callback) {
      var field = list.fields[key];

      if (field.type == 'money') {
        var currency = config.currencies[config.current_locale];

        field._formatString = (field.options.format === false) ? false : (field.options.format || currency);
      }
      _callback();
    }, function() {
      callback();
    });
  }, function() {
    res.redirect(req.headers.referer);
  });
};