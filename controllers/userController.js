var User = require('../models/users');
var passport = require('passport');
var Site = require('../models/site-config');

module.exports = {

    login: function (req, res) {
 
        Site.findOne(function (err, siteConfig) {

            if (err) {
                console.log("Error finding Site Config");
                return;
            } else {
                 res.render('user/login', {
                    title: 'Login',
                    message: req.flash('message'),
                    disableNewUsers: siteConfig.disable_new_users
                 });
            }

        });
         
    },

    doLogin: function (req, res) {

        passport.authenticate('login', {
            failureRedirect: '/login',
            successRedirect: '/admin',
            failureFlash: true // allow flash messages
        })(req, res);

    },

    doSignUp: function (req, res) {

        passport.authenticate('signup', {
            failureRedirect: '/login',
            successRedirect: '/admin',
            failureFlash: true // allow flash messages
        })(req, res);

    },

    signUp: function (req, res) {

        var siteConfig;

        if (req.session.siteConfig == undefined) {

            siteConfig = new Site({

                _id: undefined,
                site_name: "",
                home_page: "",
                disable_new_users: "N"

            });

        } else {

            siteConfig = req.session.siteConfig;

            if (siteConfig.disable_new_users == 'Y') {

                res.render('errors', {
                    title: "Page Not Found",
                    message: "The page you have requested is not available on this server",
                    nav: null,
                    loggedIn: false,
                    siteConfig: siteConfig

                });

            } else {

                res.render('adduser/index', {
                    title: 'Add User',
                    nav: null,
                    loggedIn: false,
                    message: req.flash('info'),
                    siteConfig: siteConfig
                });

            }

        }

    },

    manageUsers: function (req, res) {

        User.find(function (err, users) {
            res.render('user/manageusers', {
                title: 'Current Users',
                users: users,
                message: req.flash('message')
            });
        });

    },

    doDeleteUser: function (req, res) {

        User.findById(req.params.id, function (err, user) {
            user.remove(function (err, user) {
                req.flash('message', 'User Deleted!');
                res.redirect('/manageusers');
            });
        });

    },

    logout: function (req, res) {

        req.logout();
        res.redirect('/login');

    }

}