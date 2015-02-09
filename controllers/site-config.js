var mongoose = require('mongoose'),
    global = require('../common/common.js'),
    Site = require('../models/site-config.js'),
    Page = require('../models/page.js'),
    loggedIn = require('../check-auth'),
    async = require('async');
    

module.exports.controller = function(app) {

    app.get('/site-config', loggedIn, function(req, res) {

        async.series([

                //GET SITE CONFIG
                require('../get-site-config.js'),

                //GET SITE NAV FROM DATABASE
                require('../get-site-nav.js'),

                //GET ALL PAGE TEMPLATES 
                function(callback) {

                    Page.find(function(err, pages) {
                        callback(null, pages);
                    });

                }
            ],

            //FINALLY RENDER PAGE TEMPLATES VIEW
            function(err, results) {

                res.render('site-config', {
                    title: 'Site Config',
                    siteConfig: results[3],
                    pages: results[2],
                    message: req.flash('info'),
                    nav: results[1],
                    loggedIn: true,
                    siteConfig: results[0]
                });

            }
        )

    });

    app.post('/site-config/update', loggedIn, function(req, res) {

        //CHECK IF FIRST TIME CONFIGURING, EITHER WRITE NEW ROW TO DB OR UPDATE EXISTING ROW  
        if (req.body.config_id !== "undefined") {
            console.log("updating site-config");

            Site.findById(req.body.config_id, function(err, site) {

                site.site_name = req.body.site_name;
                site.home_page = req.body.home_page;
                site.disable_new_users = req.body.disable_new_users;

                site.save(function(err, site, count) {
                    req.flash('info', 'Site Config has been updated');
                    res.redirect('/site-config');
                });

            });


        } else {
            
console.log("creating site config");
            
            new Site({
                


                site_name: req.body.site_name,
                home_page: req.body.home_page,
                disable_new_users: req.body.disable_new_users

            }).save(function(err, Site, count) {
                req.flash('info', 'Site Config has been updated');
                res.redirect('/site-config');
            });

        }

    })

}