var mongoose = require('mongoose'),
    global = require('../common/common.js'),
    loggedIn = require('../check-auth'),
    async = require('async');

module.exports.controller = function(app) {


    app.get('/admin', loggedIn, function(req, res, next) {
 

        async.series([

                //GET SITE NAV
                require('../get-site-nav.js'),

                //GET SITE CONFIG
                require('../get-site-config.js')

            ],

            function(err, results) {
                res.render('admin', {
                    title: 'Admin Console',
                    user: req.user,
                    nav: results[0],
                    loggedIn: true,
                    siteConfig: results[1]
                });
            }
        )
    });

}