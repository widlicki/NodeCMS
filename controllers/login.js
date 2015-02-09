var mongoose = require('mongoose'),
    global = require('../common/common.js'),
    async = require('async'),
    Site = require('../models/site-config');

module.exports.controller = function(app, passport) {

    //LOGIN FORM
    app.get('/login', function(req, res) {

        var navStr = global.getSiteNav(function(navStr) {

            res.render('login/index', {
                title: 'Login',
                nav: navStr,
                loggedIn: false,
                message: req.flash('info')
            });

        });

    });

    //HANDLE LOGIN
    app.post('/login', function(req, res) {
         
        passport.authenticate('local-login', {
            failureRedirect: 'login',
            successRedirect: 'admin',
            failureFlash: true // allow flash messages
        })(req, res);
    
    });

    //BEGIN: REMOVE FOR PRODUCTION IF NEEDED 
    //REGISTER USER
    app.get('/adduser', function(req, res) {

        Site.findOne(function(err, siteConfig) {

            //IF SITE CONFIG DOES NOT EXIST ALLOW TO ADD USER (INITIAL SETTUP OF CMS)
            if(siteConfig == null){
                                        
                        siteConfig = new Site({
                                           
                            _id: undefined,
                            site_name: "",
                            home_page: "",
                            disable_new_users: "N"

                        });
            } 

            if(siteConfig.disable_new_users == 'Y'){

                res.render('errors', {
                title: "Page Not Found",
                message: "The page you have requested is not available on this server",
                nav: null,
                loggedIn: false,
                siteConfig: siteConfig
                 
            });

            }else{

                res.render('adduser/index', {
                title: 'Add User',
                nav: null,
                loggedIn: false,
                message: req.flash('info'),
                siteConfig: siteConfig
            });

            } 
 
        });
 

    });

    // PROCESS THE SIGNUP FORM
    app.post('/adduser', passport.authenticate('local-signup', {
        
        successRedirect: '/login', // redirect to the secure profile section
        failureRedirect: '/adduser', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    
    }));
    //END: REMOVE FOR PRODUCTION IF NEEDED 
    

    //LOGOUT USER
    app.get('/logout', function(req, res) {
        
        req.logout();
        res.redirect('/');
    
    });

}