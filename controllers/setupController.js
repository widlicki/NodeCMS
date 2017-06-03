var mongoose = require('mongoose');
var Site = require('../models/site-config');
var Config = require('../models/config');
var passport = require('passport');


module.exports = {

    getSetupWizard: function (req, res) {

        res.render('setup/setup-user', {
            title: 'Setup Wizard',
            message: req.flash('info'),
            nav: req.session.nav,
            loggedIn: true,
            siteConfig: req.session.siteConfig,
        });

    },

    doSetupUser: function (req, res) {

        passport.authenticate('signup', {
            failureRedirect: '/setup',
            successRedirect: '/setup-site',
            failureFlash: true // allow flash messages
        })(req, res);


    },

    setupSite: function (req, res) {

        res.render('setup/setup-site', {
            title: 'Setup Wizard',
            message: req.flash('info'),
            nav: req.session.nav,
            loggedIn: true,
            siteConfig: req.session.siteConfig,
        });

    },

    doSetupSite: function (req, res) {

        //CHECK IF FIRST TIME CONFIGURING, EITHER WRITE NEW ROW TO DB OR UPDATE EXISTING ROW  
        if (req.body.config_id !== "undefined") {
            console.log("updating sitConfig");

            Site.findById(req.body.config_id, function (err, site) {

                site.site_name = req.body.site_name;
                site.home_page = '';
                site.disable_new_users = req.body.disable_new_users;
                site.setup_wizard = 'N';

                site.save(function (err, site, count) {
                    req.flash('info', 'Site setup completed succesfully');
                    res.redirect('/login');
                });

            });


        } else {

            console.log("creating site config");

            new Site({

                site_name: req.body.site_name,
                home_page: '',
                disable_new_users: req.body.disable_new_users,
                setup_wizard: 'N'

            }).save(function (err, Site, count) {
                req.flash('info', 'Site setup completed succesfully');
                res.redirect('/login');
            });

        }

    }



}