var mongoose = require('mongoose'),
    PageTemplate = require('../models/page-template'),
    global = require('../common/common.js'),
    loggedIn = require('../check-auth'),
    async = require('async');

module.exports.controller = function(app) {

    app.get('/page-template', loggedIn, function(req, res) {

        async.series([

                //GET SITE CONFIG
                require('../get-site-config.js'),

                //GET SITE NAV
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
                
                res.render('page-template', {
                    title: 'Manage Page Templates',
                    pageTemplates: results[2],
                    nav: results[1],
                    loggedIn: true,
                    message: req.flash('info'),
                    siteConfig: results[0]

                });
           
            }
        )

    });

    app.get('/page-template/create', loggedIn, function(req, res) {

        async.series([

                //GET SITE CONFIG
                require('../get-site-config.js'),

                //GET SITE NAV
                require('../get-site-nav.js')

            ],

            function(err, results) {
               
                res.render('page-template/create', {
                    title: 'Create Page Template',
                    nav: results[1],
                    loggedIn: true,
                    siteConfig: results[0]
                });
            
            }
        )

    });


    app.post('/page-template/create', loggedIn, function(req, res) {

        function createHtmlClass(field_name) {
           
            field_name = field_name.replace(/ /g, "-").toLowerCase();
            return field_name;
        
        }

        var field_name = "",
            field_value = "",
            formFieldData = global.parseCustomFields(req.body),
            fieldsJson = JSON.stringify(formFieldData);

        new PageTemplate({
            
            name: req.body.name,
            description: req.body.description,
            field_list: fieldsJson

        }).save(function(err, PageTemplate, count) {
            
            req.flash('info', 'Template Has been created!');
            res.redirect('/page-template');
        
        });

    });

    app.get('/page-template/delete/:id', loggedIn, function(req, res) {

        async.series([

                //GET SITE CONFIG
                require('../get-site-config.js'),

                //GET SITE NAV FROM DATABASE
                require('../get-site-nav.js'),

                //GET ALL PAGE TEMPLATES 
                function(callback) {
                    
                    PageTemplate.findById(req.params.id, function(err, pageTemplate) {
                        callback(null, pageTemplate);
                    });

                }
            ],

            //FINALLY RENDER PAGE TEMPLATES VIEW
            function(err, results) {

                res.render('page-template/delete', {
                    title: 'Delete Page Template',
                    pageTemplate: results[2],
                    nav: results[1],
                    loggedIn: true,
                    siteConfig: results[0]

                });
            }
        )

    });

    app.post('/page-template/delete/:id', loggedIn, function(req, res) {

        PageTemplate.findById(req.params.id, function(err, pageTemplate) {
  
            pageTemplate.remove(function(err, photo) {
                req.flash('info', 'Template Has been deleted!');
                res.redirect('/page-template');
            });
  
        });

    });


    app.get('/page-template/update/:id', loggedIn, function(req, res) {

        async.series([

                //GET SITE CONFIG
                require('../get-site-config.js'),

                //GET SITE NAV FROM DATABASE
                require('../get-site-nav.js'),

                //GET ALL PAGE TEMPLATES 
                function(callback) {
                   
                    PageTemplate.findById(req.params.id, function(err, pageTemplate) {
                        callback(null, pageTemplate);
                    });

                }
            ],

            //FINALLY RENDER PAGE TEMPLATES VIEW
            function(err, results) {
 
                res.render('page-template/update', {
                    title: 'Update Template',
                    pageTemplate: results[2],
                    nav: results[1],
                    loggedIn: true,
                    siteConfig: results[0]

                });
            }
        )

    });

    app.post('/page-template/update/:id', loggedIn, function(req, res) {

        function createHtmlClass(field_name) {

            field_name = field_name.replace(/ /g, "-").toLowerCase();
            return field_name;

        }

        var field_name = "",
            field_value = "";
            formFieldData = global.parseCustomFields(req.body),
            fieldsJson = JSON.stringify(formFieldData);
 
        PageTemplate.findById(req.params.id, function(err, pageTemplate) {
           
            pageTemplate.name = req.body.name;
            pageTemplate.description = req.body.description;
            pageTemplate.field_list = fieldsJson;

            pageTemplate.save(function(err, pageTemplate, count) {
                
                res.redirect('/page-template');
            
            });
        });

    });

}