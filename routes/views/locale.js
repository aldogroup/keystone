var keystone = require('../../'),
    config = require('config'),
    async = require('async');

exports = module.exports = function(req, res) {
  var locale = req.params.locale;

  req.session.current_locale = locale;

  async.forEach(Object.keys(keystone.lists), function (key, callback) {
    var list = keystone.lists[key];

    async.forEach(Object.keys(list.fields), function (key, _callback) {
      var field = list.fields[key];

      if (field.type == 'money') {
        var currency = config.currencies[locale];

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