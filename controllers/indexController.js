const Site = require('../models/site-config');
const logger = require('../logger');

module.exports = {
	getHomepage: function (req, res) {
		Site.findOne(function (err, siteConfig) {
			if (err) {
				logger.error("Error finding Site Config");
				return;
			}

			if (siteConfig) {
				if (siteConfig.setup_wizard === 'Y') {
					res.redirect('/setup');
				} else {
					if (siteConfig.home_page !== undefined && siteConfig.home_page !== '') {
						res.redirect('/site/' + siteConfig.home_page);
					} else {
						logger.info('No homepage defined, redirecting to homePageNotFound');
						res.redirect('/homePageNotFound');
					}
				}
			} else {
				res.redirect('/setup');
			}
		});
	},

	getHomePageNotFound: function (req, res) {
		res.render('site/blank', {
			title: 'Homepage Not found',
			message: req.flash('info'),
			nav: req.session.nav,
			loggedIn: true,
			siteConfig: req.session.siteConfig,
		});
	},

	getSetupWizard: function (req, res) {
		res.render('setup', {
			title: 'Setup Wizard',
			message: req.flash('info'),
			nav: req.session.nav,
			loggedIn: true,
			siteConfig: req.session.siteConfig,
		});
	}
}