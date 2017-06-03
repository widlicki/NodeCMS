var mongoose = require('mongoose'),
    global = require('../common/common.js'),
    Site = require('../models/site-config.js'),
    Page = require('../models/page.js'),
    passport = require('passport');


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
            console.log("updating sitConfig");

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

            console.log("creating site config");

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
    
    doSetup: function(req, res){
          
        passport.authenticate('signup', {
            failureRedirect: '/login',
            successRedirect: '/admin',
            failureFlash: true // allow flash messages
        })(req, res);
        
    }

}