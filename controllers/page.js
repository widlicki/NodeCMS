var mongoose = require('mongoose'),
    Page = require('../models/page'),
    PageTemplate = require('../models/page-template'),
    loggedIn = require('../check-auth'),
    async = require('async');

module.exports.controller = function(app) {

    app.get('/page', loggedIn, function(req, res) {

        async.series([

                //GET SITE CONFIG
                require('../get-site-config.js'),

                //GET SITE NAV FROM DATABASE
                require('../get-site-nav.js'),

                //GET ALL PAGE TEMPLATES 
                function(callback) {
                    
                    Page.find(function(err, pages, count) {
                        callback(null, pages);
                    });
                
                }
            ],

            //FINALLY RENDER PAGE TEMPLATES VIEW
            function(err, results) {
               
                res.render('page', {
                    title: 'Manage Pages',
                    message: req.flash('info'),
                    pages: results[2],
                    nav: results[1],
                    loggedIn: true,
                    siteConfig: results[0]
                });
            
            }
        )




    });

    app.get('/page/create', loggedIn, function(req, res) {

        async.series([

                //GET SITE CONFIG
                require('../get-site-config.js'),

                //GET SITE NAV FROM DATABASE
                require('../get-site-nav.js'),

                //GET ALL PAGE TEMPLATES 
                function(callback) {
                    
                    PageTemplate.find(function(err, pageTemplates, count) {
                        callback(null, pageTemplates);
                    });
                
                }
            ],

            //FINALLY RENDER PAGE TEMPLATES VIEW
            function(err, results) {
                
                res.render('page/create', {
                    title: 'Add Page',
                    pageTemplates: results[2],
                    nav: results[1],
                    loggedIn: true,
                    siteConfig: results[0]
                });
            
            }
        )




    });

    app.post('/page/create', loggedIn, function(req, res) {

        var add_to_nav = false,
            searchable = false;

        if (req.body.add_to_nav == 'Y') {
            add_to_nav = true;
        }

        if (req.body.searchable == 'Y') {
            searchable = true;
        }

        new Page({
            
            name: req.body.name,
            description: req.body.description,
            template: req.body.template,
            add_to_nav: add_to_nav,
            //thumb_width : req.body.thumb_width,
            //thumb_height : req.body.thumb_height,
            contenthtml: req.body.contenthtml,
            formhtml: req.body.formhtml,
            searchable: searchable
        
        }).save(function(err, Page, count) {
            
            req.flash('info', 'Page has been created!');
            res.redirect('/page');
        
        });

    });

    app.get('/page/update/:id', loggedIn, function(req, res) {

        async.series([

                //GET SITE CONFIG
                require('../get-site-config.js'),

                //GET SITE NAV FROM DATABASE
                require('../get-site-nav.js'),

                //GET ALL PAGE TEMPLATES 
                function(callback) {
                    
                    Page.findById(req.params.id, function(err, page) {
                        callback(null, page);
                    });
                
                },

                function(callback) {
                
                    PageTemplate.find(function(err, pageTemplates) {
                        callback(null, pageTemplates);
                    });
                
                }

            ],

            //FINALLY RENDER PAGE TEMPLATES VIEW
            function(err, results) {
            
                res.render('page/update', {
                    title: 'Update Page',
                    page: results[2],
                    pageTemplates: results[3],
                    nav: results[1],
                    loggedIn: true,
                    siteConfig: results[0]
                });
            
            }
        )

    });

    app.post('/page/update/:id', loggedIn, function(req, res) {

        Page.findById(req.params.id, function(err, page) {

            page.name = req.body.name;
            page.description = req.body.description;
            page.template = req.body.template;
             
            if (req.body.add_to_nav == 'Y') {
                page.add_to_nav = true;
            } else {
                page.add_to_nav = false;
            }

            page.contenthtml = req.body.contenthtml;
            page.formhtml = req.body.formhtml;
            page.searchable = req.body.searchable;

            if (req.body.searchable == 'Y') {
                page.searchable = true;
            } else {
                page.searchable = false;
            }

            //page.thumb_width = req.body.thumb_width;
            //page.thumb_height = req.body.thumb_height;

            page.save(function(err, page, count) {

                req.flash('info', 'Page has been updated!');
                res.redirect('/page');

            });
        });

    });

    app.get('/page/delete/:id', loggedIn, function(req, res) {

        async.series([

                //GET SITE CONFIG
                require('../get-site-config.js'),

                //GET SITE NAV FROM DATABASE
                require('../get-site-nav.js'),

                //GET ALL PAGE TEMPLATES 
                function(callback) {
 
                    Page.findById(req.params.id, function(err, page) {
                        callback(null, page);
                    });

                }
            ],

            //FINALLY RENDER PAGE TEMPLATES VIEW
            function(err, results) {

                res.render('page/delete', {
                    title: 'Delete Page',
                    page: results[2],
                    nav: results[1],
                    loggedIn: true,
                    siteConfig: results[0]
                });
 
            }
        )        
    });

    app.post('/page/delete/:id', loggedIn, function( req, res)  {

        Page.findById(req.params.id, function( err, page ) {

            page.remove(function( err, page ) {
                req.flash('info', 'Page Has been deleted!');
                res.redirect('/page');
            });

        });
    });


    app.get('/page/getTemplateFields/:name', loggedIn, function( req, res ) {

        PageTemplate.findOne({'name': req.params.name}, function( err, pageTemplate ) {
            console.log(pageTemplate);
            res.send(pageTemplate);
            return;
        });

    });


}