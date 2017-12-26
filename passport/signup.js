const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/users');
const bCrypt = require('bcrypt-nodejs');
const logger = require('../logger');

module.exports = function (passport) {
	passport.use('signup', new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true // allows us to pass back the entire request to the callback
	},

	function (req, email, password, done) {  
		findOrCreateUser = function () {
			// find a user in Mongo with provided username
			logger.info('in findOrCreateUser()');

			User.findOne({
				'email': email
			}, function (err, user) {
				// In case of any error, return using the done method
				if (err) {
					logger.error('Error in SignUp: ' + err);
					return done(err);
				}
				// already exists
				if (user) {
					logger.info('Updating User: ' + email);
					user.password = createHash(password);
					user.login_attempts = 0;
					user.lock_until = 1;
					user.disabled = req.body.disabled;
					user.first_name = req.body.first_name;
					user.last_name = req.body.last_name;
					user.role = req.body.role;			   
			
					user.save(function (err) {
						if (err) {
							logger.error('Error in Saving user: ' + err);
							throw err;
						}
						logger.info('User Registration succesful');
						return done(null, false, req.flash('message', 'User Updated'));
					});

				} else {
					// if there is no user with that email
					// create the user
					var newUser = new User();
					logger.info("creating new user: " + email);
					// set the user's local credentials
					newUser.email = email;
					newUser.password = createHash(password);
					newUser.login_attempts = 0;
					newUser.lock_until = 1;
					newUser.disabled = false;
					newUser.first_name = req.body.first_name;
					newUser.last_name = req.body.last_name;
						
					if(req.body.role !== undefined){
						newUser.role = req.body.role; 
					} else {
						newUser.role = 'user';  
					}

					// save the user
					newUser.save(function (err) {
						if (err) {
							logger.error('Error in Saving user: ' + err);
							throw err;
						}
						logger.info('User Registration succesful');
						return done(null, newUser, req.flash('message', 'User Succesfully Created'));
					});
				}
			});
		};
		// Delay the execution of findOrCreateUser and execute the method
		// in the next tick of the event loop
		process.nextTick(findOrCreateUser);
	}));
 
	// Generates hash using bCrypt
	var createHash = function (password) {
		return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
	}
}