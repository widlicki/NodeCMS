const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/users');
const bCrypt = require('bcrypt-nodejs');
const logger = require('../logger');

module.exports = function (passport) {

	passport.use('login', new LocalStrategy({
		passReqToCallback: true
	},
	function (req, email, password, done) {
		// check in mongo if a user with username exists or not
		User.findOne({
			'email': email
		},
		function (err, user) {
			// In case of any error, return using the done method
			if (err){
				logger.error(err);
				return done(err);
			}

			// Username does not exist, log the error and redirect back
			if (!user) {
				logger.info(`User Not Found with username: ${email}`);
				return done(null, false, req.flash('message', 'User Not found.'));
			}
			// User found but account is locked
			else if (user && user.lock_until > Date.now()) {
				logger.info(`User account is locked for ${email}`);
				return done(null, false, req.flash('message', 'Your account is locked due to too many failed login attempts'));
			}

			// User exists and is not locked but wrong password, log the error 
			if (!isValidPassword(user, password)) {
				user.login_attempts += 1;
				incLoginAttempts(user);
				logger.info(`Invalid password provided for user: ${email}`);

				if (user.login_attempts === 5) {
					logger.info(`Locking account for user: ${email}`);
					return done(null, false, req.flash('message', 'Your account has been locked due to too many failed login attempts'));
				}

				return done(null, false, req.flash('message', 'Invalid Password')); // redirect back to login page
			}
			// User and password both match, return user from done method
			// which will be treated like success
			// reset login attempts count
			resetLoginAttempts(user);
				
			req.session.role = user.role;				
			return done(null, user);
		});
	}));

	var isValidPassword = function (user, password) {
		return bCrypt.compareSync(password, user.password);
	}

	var incLoginAttempts = function (user) {
		//reset if account unloced but still incorrect login
		if (user.lock_until !== 1 && user.lock_until < Date.now()) {
			user.login_attempts = 1
			user.lock_until = 1
		}

		if (user.login_attempts === 5) {
			user.lock_until = Date.now() + (1000 * 60 * 10);
		}

		user.save(function (err, user) {
			if (err){
				logger.error(`Error saving failed login attempt: ${err}`);
			}
		});
	}

	var resetLoginAttempts = function (user) {
		user.lock_until = 1;
		user.login_attempts = 0;
		user.save(function (err, user) {
			logger.info("Reseting login attempts");
			if (err){
				logger.error(`Error resetting login attempts: ${err}`);
			}
		});
	};
}