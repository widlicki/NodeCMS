var mongoose = require('mongoose'),
    Content = require('../models/content'),
    Page = require('../models/page'),
    PageTemplate = require('../models/page-template'),
    customFields = require('mongoose-custom-fields'),
    global = require('../common/common.js'),
    path = require('path'),
    logger = require('../logger'),
    async = require('async'),
    Site = require('../models/site-config');


module.exports.controller = function(app) {

    //DISPLAY IMAGE FILES IN VIEWS
    app.get('/images/:file_name', function(req, res) {
        res.sendFile(path.resolve('./uploads/' + req.params.file_name));
    });


    function parseContent(page, pageContents) {

        var contentDisp = "",
            thisContentKeys = [],
            thisKey = "",
            templateDispField = "",
            fieldContent = "",
            allContent = "";

        for (i = 0; i < pageContents.length; i++) {
            
            contentDisp = page.contenthtml;
            thisContentKeys = pageContents[i].customKeys;

            for (j = 0; j < thisContentKeys.length; j++) {
                
                thisKey = thisContentKeys[j];
                templateDispField = "[" + thisKey + "]";
                fieldContent = pageContents[i].customField(thisKey);
                contentDisp = contentDisp.replace(templateDispField, fieldContent);
            
            }

            allContent += contentDisp;
        
        }

        return allContent;
    }

    app.post('/site/search', function(req, res) {

        var search_field = req.body.search_field,
            search_value = req.body.search_value,
            search_page = req.body.page,
            page = null,
            templates = null,
            content = null,
            customFields = null,
            contentKeys = null,
            allContent = "";


        async.waterfall([

                //GET SITE NAVIGATION
                require('../get-site-nav.js'),

                function(siteNav, callback) {

                    var results = [];
                    results.push(siteNav);

                    Page.findById(search_page, function(err, page) {
                        results.push(page);
                        callback(null, results);
                    });
                
                },

                function(results, callback) {

                    var page = results[1];

                    //SEARCH  FOR ALL PAGES BY ID AND CUSTOM FIELDS BY NAME AND VALUE
                    Content.find({
                        page: search_page,
                        _customFields: {
                            $elemMatch: {
                                name: search_field
                            }
                        },
                        _customFields: {
                            $elemMatch: {
                                value: search_value
                            }
                        }
                    }, function(err, content) {

                        if (err) return;

                        allContent = parseContent(page, content)
                        results.push(allContent);
                        callback(null, results);

                    });
                },

                //GET SITE CONFIG INFO
                function(results, callback) {
                     
                    Site.findOne(function(err, siteConfig) {
                        
                        if(siteConfig == null){
                            
                            siteConfig = new Site({
                                               
                                _id: undefined,
                                site_name: "",
                                home_page: "",
                                disable_new_users: ""

                            });
                        }

                        results.push(siteConfig);
                        callback(null, results);
                    
                    });
                }

            ],

            function(err, results) {

                var loggedIn = false;

                if (req.session.passport.user !== undefined) {
                    loggedIn = true
                }

                res.render('site/content', {
                    title: 'Content',
                    page: results[1],
                    content: results[2],
                    nav: results[0],
                    searchFields: null,
                    loggedIn: loggedIn,
                    siteConfig: results[3]
                });

            }
        )

    });

    app.get('/site/:id', function(req, res) {

        var page = null;
        var templates = null;
        var content = null;
        var customFields = null;
        var contentKeys = null;
        var allContent = "";

        async.waterfall([

                //GET SITE NAVIGATION
                require('../get-site-nav.js'),

                function(siteNav, callback) {

                    var results = [];
                    results.push(siteNav);

                    Page.findById(req.params.id, function(err, page) {
                        results.push(page);
                        callback(null, results);
                    });
                },

                function(results, callback) {

                    var page = results[1];

                    Content.find({
                        'page': req.params.id
                    }, function(err, pageContents) {

                        if (err) return;

                        allContent = parseContent(page, pageContents)
                        results.push(allContent);
                        callback(null, results);

                    });
                },

                function(results, callback) {

                    var page = results[1];

                    //if page is searchable get template information for searchable fields
                    if (page.searchable) {

                        PageTemplate.findOne({
                            'name': page.template
                        }, function(err, pageTemplate) {

                            var field_ary = [];
                            var fieldObj = null;

                            for (var i = 1; i < 21; i++) {
                                fieldObj = JSON.parse(pageTemplate.field_list);

                                if (fieldObj.fields[i - 1] !== undefined) {

                                    if (fieldObj.fields[i - 1].search == 'yes') {
                                        field_ary.push(fieldObj.fields[i - 1].name)
                                    }

                                }
                            }

                            results.push(field_ary);
                            callback(null, results);

                        });

                    } else {
                        
                        callback(null, results);
                    
                    }

                },

                //GET SITE CONFIG INFO
                function(results, callback) {
                     
                    Site.findOne(function(err, siteConfig) {
                        
                        if(siteConfig == null){
                            
                            siteConfig = new Site({
                                               
                                _id: undefined,
                                site_name: "",
                                home_page: "",
                                disable_new_users: ""

                            });
                        }

                        results.push(siteConfig);
                        callback(null, results);
                    
                    });
                }

            ],

            function(err, results) {

                var loggedIn = false;
 
                if (req.session.passport.user !== undefined) {
                    loggedIn = true
                }

                res.render('site/content', {
                    title: 'Content',
                    page: results[1],
                    content: results[2],
                    nav: results[0],
                    searchFields: results[3],
                    loggedIn: loggedIn,
                    siteConfig: results[4]

                });

            }
        )

    });

}