const logger = require('../logger');

const authenticated = function authenticated (req, res, next) {
	if (req.session.passport.user !== undefined) {
		next();    
	} else {
		logger.info("User not logged in, redirecting to login page");
		res.redirect( '/login');
	}
}

module.exports = authenticated;