var User = require('../models/users');
var passport = require('passport');
var Site = require('../models/site-config');
var bCrypt = require('bcrypt-nodejs');
let logger = require('../logger');

module.exports = {
	login: function (req, res) {
		Site.findOne(function (err, siteConfig) {
			if (err) {
				logger.error("Error finding Site Config");
				return;
			} else {
				res.render('user/login', {
					title: 'Login',
					message: req.flash('message'),
					disableNewUsers: siteConfig.disable_new_users
				});
			}
		});
	},

	doLogin: function (req, res) {
		passport.authenticate('login', {
			failureRedirect: '/login',
			successRedirect: '/',
			failureFlash: true // allow flash messages
		})(req, res);
	},

	doSignUp: function (req, res) {
		passport.authenticate('signup', {
			failureRedirect: '/sign-up',
			successRedirect: '/login',
			failureFlash: true // allow flash messages
		})(req, res);
	},

	signUp: function (req, res) {
		var siteConfig;
		if (req.session.siteConfig === undefined) {
			siteConfig = new Site({
				_id: undefined,
				site_name: "",
				home_page: "",
				disable_new_users: "N"
			});
		} else {
			siteConfig = req.session.siteConfig;
			if (siteConfig.disable_new_users === 'Y') {
				res.render('errors', {
					title: "Page Not Found",
					message: "The page you have requested is not available on this server",
					nav: null,
					loggedIn: false,
					siteConfig: siteConfig
				});
			} else {
				res.render('adduser/index', {
					title: 'Add User',
					nav: null,
					loggedIn: false,
					message: req.flash('info'),
					siteConfig: siteConfig
				});
			}
		}
	},

	createUser: function (req, res) {
		res.render('user/create', {
			title: 'Add User',
			nav: req.session.nav,
			loggedIn: true,
			siteConfig: req.session.siteConfig,
			message: req.flash('message')
		});
	},
	
	doCreateUser: function (req, res) {
		logger.info("Adding New User");
		passport.authenticate('signup', {
			failureRedirect: '/user/create',
			successRedirect: '/user/manageUsers',
			failureFlash: true // allow flash messages
		})(req, res);
	},
	
	updateUser: function (req, res) {
		User.findById(req.params.id, function (err, user) {
			if (!err) {
				res.render('user/update', {
					title: 'Add User',
					nav: req.session.nav,
					loggedIn: true,
					siteConfig: req.session.siteConfig,
					user: user
				}); 
			} else {
				logger.error(err);
			}
		});
	},
	
	doUpdateUser: function (req, res) {
		User.findById(req.params.id, function (err, user) {
			user.email = req.body.email;
			user.first_name = req.body.first_name;
			user.last_name = req.body.last_name;
			user.role = req.body.role;
			if(req.body.password !== "userpassword"){
				user.password =  bCrypt.hashSync(req.body.password, bCrypt.genSaltSync(10), null); 
			} else {
				user.password = user.password; 
			}
			user.login_attempts = user.login_attempts 
			user.lock_until = user.lock_until 
			user.disabled = user.disabled

			user.save(function (err, page, count) {
				req.flash('info', 'User has been updated!');
				res.redirect('/user/manageUsers');
			});
		});
	},
	
	manageUsers: function (req, res) {
		User.find(function (err, users) {
			res.render('user/manageUsers', {
				title: 'Current Users',
				nav: req.session.nav,
				users: users,
				loggedIn: true,
				siteConfig: req.session.siteConfig,
				message: req.flash('message')
			});
		});
	},

	doDeleteUser: function (req, res) {
		logger.info("Deleting user: " + req.body.id);

		User.findById(req.body.id, function (err, user) {
			user.remove(function (err, user) {
				logger.info("User deleted");
				res.end('{"status" : 200}'); 
			}); 
		});
	},
	
	notAuthorized: function (req, res) {
		res.render('user/notAuth', {
			title: 'Not Authorized',
			nav: req.session.nav,
			loggedIn: true,
			siteConfig: req.session.siteConfig
		});
	},

	logout: function (req, res) {
		req.logout();
		req.session.destroy();
		res.redirect('/login');
	}

}