var mongoose = require('mongoose'),
    global = require('../common/common.js'),
    Site = require('../models/site-config');

module.exports.controller = function(app) {

    //REDIRECT USER TO HOME PAGE SET IN SITE CONFIG
    app.get('/', function(req, res) {

        Site.findOne(function(err, siteConfig) {

            if (err) {
                console.log("Error finding Site Config");
                return;
            } else {
                res.redirect('/site/' + siteConfig.home_page);
            }

        });

    });

}