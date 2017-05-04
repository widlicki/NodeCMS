var mongoose = require('mongoose');
var global = require('../common/common.js');
var session = require('express-session');

module.exports = {

    getAdminConsole: function (req, res) {

        console.log("in admin controller");

        res.render('admin', {
            title: 'Admin Console',
            user: req.user,
            nav: req.session.nav,
            loggedIn: true,
            siteConfig: req.session.siteConfig
        });
    }

}