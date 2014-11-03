var keystone = require('../../'),
	config = require('config');

exports = module.exports = function(req, res) {
	var locale = req.session.current_locale ? req.session.current_locale : config.current_locale;

	keystone.render(req, res, 'home', {
		section: 'home',
		page: 'home',
		orphanedLists: keystone.getOrphanedLists(),
		current_locale: locale
	});

};
