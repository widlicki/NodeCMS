module.exports = {
	getAdminConsole: function (req, res) {
		res.render('admin', {
			title: 'Admin Console',
			user: req.user,
			nav: req.session.nav,
			loggedIn: true,
			siteConfig: req.session.siteConfig
		});
	}
}