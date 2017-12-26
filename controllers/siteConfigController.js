const Site = require('../models/site-config.js');
const Page = require('../models/page.js');
const passport = require('passport');
const logger = require('../logger');

module.exports = {
	siteConfig: function (req, res) {
		Page.find(function (err, pages) {
			res.render('site-config', {
				title: 'Site Config',
				message: req.flash('info'),
				nav: req.session.nav,
				loggedIn: true,
				siteConfig: req.session.siteConfig,
				pages: pages
			});
		});
	},

	saveSiteConfig: function (req, res) {
		//CHECK IF FIRST TIME CONFIGURING, EITHER WRITE NEW ROW TO DB OR UPDATE EXISTING ROW  
		if (req.body.config_id !== "undefined") {
			logger.info("Updating Site Config");
			Site.findById(req.body.config_id, function (err, site) {
				site.site_name = req.body.site_name;
				site.home_page = req.body.home_page;
				site.disable_new_users = req.body.disable_new_users;
				site.setup_wizard = req.body.setup_wizard;
					
				site.save(function (err, site, count) {
					req.flash('info', 'Site Config has been updated');
					res.redirect('/site-config');
				});
			});
		} else {
			logger.info("Creating Site Config");
			
			new Site({
				site_name: req.body.site_name,
				home_page: req.body.home_page,
				disable_new_users: req.body.disable_new_users,
				setup_wizard: req.body.setup_wizard
			}).save(function (err, Site, count) {
				req.flash('info', 'Site Config has been updated');
				res.redirect('/site-config');
			});
		}
	},
	
	doSetup: function (req, res) {
		passport.authenticate('signup', {
			failureRedirect: '/login',
			successRedirect: '/admin',
			failureFlash: true // allow flash messages
		})(req, res);
	}
}