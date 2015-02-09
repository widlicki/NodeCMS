var mongoose = require('mongoose'),
    Page = require('../models/page'),
    PageTemplate = require('../models/page-template'),
    Content = require('../models/content'),
    customFields = require('mongoose-custom-fields'),
    global = require('../common/common.js'),
    fs = require('fs'),
    loggedIn = require('../check-auth'),
    async = require('async'),
    Site = require('../models/site-config');


module.exports.controller = function(app) {

    app.get('/content', loggedIn, function(req, res) {

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
                res.render('content', {
                    title: 'Manage Content',
                    pages: results[2],
                    nav: results[1],
                    loggedIn: true,
                    siteConfig: results[0]
                });
            }
        )

    });

    app.get('/content/manage/:id', loggedIn, function(req, res) {

        async.series([

                //GET SITE CONFIG
                require('../get-site-config.js'),

                //GET SITE NAV FROM DATABASE
                require('../get-site-nav.js'),

                //GET ALL PAGE INFO 
                function(callback) {
                    Page.findById(req.params.id, function(err, page) {
                        callback(null, page);
                    });
                },

                //GET ALL PAGE CONTENT
                function(callback) {
                    Content.find({
                        'page': req.params.id
                    }, function(err, pageContents) {
                        callback(null, pageContents);
                    });
                }

            ],

            //FINALLY RENDER CONTENT VIEW
            function(err, results) {

                var page = results[2],
                    content = results[3],
                    allContent = "",
                    contentDisp = "",
                    fieldContent = "",
                    thisKey = "",
                    templateDispField = "",
                    contentDisp = page.contenthtml;

                for (i = 0; i < content.length; i++) {
                    contentDisp = page.contenthtml;
                    thisContentKeys = content[i].customKeys;

                    for (j = 0; j < thisContentKeys.length; j++) {
                        thisKey = thisContentKeys[j];
                        templateDispField = "[" + thisKey + "]";
                        fieldContent = content[i].customField(thisKey);
                        contentDisp = contentDisp.replace(templateDispField, fieldContent);
                    }

                    allContent += '<div class="content-mng">' + contentDisp +
                        '<a href="/content/delete/' + content[i].id + '">Delete</a>&nbsp;&nbsp;&nbsp;' +
                        '<a href="/content/update/' + content[i].id + '">Update</a></div>';
                }

                res.render('content/manage', {
                    title: 'Content',
                    content: allContent,
                    message: req.flash('info'),
                    page_id: req.params.id,
                    nav: results[1],
                    loggedIn: true,
                    siteConfig: results[0]
                });

            }
        )
    });

    //CONTENT CREATE FORM 
    app.get('/content/create/:id', loggedIn, function(req, res) {

        async.waterfall([
 
                //GET SITE NAV FROM DATABASE
                require('../get-site-nav.js'),

                //GET PAGE INFO
                function(siteNav, callback) {

                    var results = [];
                    results.push(siteNav);

                    Page.findById(req.params.id, function(err, page) {
                        results.push(page);
                        callback(null, results);
                    });
                },

                //GET TEMPLATE INFO
                function(results, callback) {
                     
                    PageTemplate.findOne({'name': results[1].template}, function(err, pageTemplate) {
                        
                        results.push(pageTemplate);
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

            //FINALLY RENDER CONTENT CREATE VIEW
            function(err, results) {

                res.render('content/create', {
                    title: 'Create Content',
                    page: results[1],
                    pageTemplate: results[2],
                    nav: results[0],
                    loggedIn: true,
                    message: req.flash('info'),
                    siteConfig: results[3]
                });
            
            }
        )

    });

    //HANDLE CONTENT CREATE
    app.post('/content/create', loggedIn, function(req, res) {

        PageTemplate.findById(req.body.page_template_id, function(err, pageTemplate) {

            var PostParams = Object.keys(req.body),
                content = new Content(),
                imgObj = null,
                key_ary = [],
                img_name_ary = [],
                img_field_ary = [],
                save_record = true,
                thisField = "";

            content.page = req.body.page_id;
            content.create_dt = new Date();
            content.update_dt = new Date();

            //Get Form field names for file upload fields
            imgObj = JSON.stringify(req.files);
            imgObj = JSON.parse(imgObj);
            console.log(imgObj);

            for (var key in imgObj) {
                console.log(key);
                key_ary.push(key);
            }

            if (req.body.has_file == 'true') {

                for (i = 0; i < key_ary.length; i++) {

                    if (req.files[key_ary[i]] !== undefined) {
                        if (done == true) {

                            imgObj = JSON.stringify(req.files[key_ary[i]]);
                            imgObj = JSON.parse(imgObj);
                            img_name_ary.push(imgObj.name);
                            img_field_ary.push(imgObj.fieldname);




                        }
                    }
                }
            }
 
            var fieldObj = JSON.parse(pageTemplate.field_list);
             
            PostParams.forEach(function(param) {

                if (param != 'page_id' && param != 'page_template_id') {

                    var passedValidation = true;


                    //Check if required fields have values
                    fieldObj.fields.forEach(function(field) {

                        if (param == field.class && field.req == "yes" && req.body[param] == "") {
                            passedValidation = false;
                            save_record = false;
                            thisField = field.name;
                        }
                    });

                    if (passedValidation) {
                        content.customField(param, req.body[param]);
                    }

                }

            });

            if (save_record) {

                //add files that were uploaded to db custom fields
                for (i = 0; i < img_name_ary.length; i++) {
                    if (img_name_ary[i] !== undefined) {
                        content.customField(img_field_ary[i], img_name_ary[i]);
                        content.customField('thumbnail|' + img_field_ary[i], "");
                    }
                }

                content.save(function(err) {
                    req.flash('info', 'Content Has been added!')
                    res.redirect('/content/manage/' + req.body.page_id);

                });
            } else {
                req.flash('info', thisField + " is a required field!");
                res.redirect('/content/create/' + req.body.page_id);
            }
        });
    });

    //CONTENT UPDATE FORM
    app.get('/content/update/:id', loggedIn, function(req, res) {

        async.waterfall([

                require('../get-site-nav.js'),

                function(siteNav, callback) {

                    var results = [];
                    results.push(siteNav);

                    Content.findById(req.params.id, function(err, content) {
                        results.push(content);
                        callback(null, results);
                    });
                },

                function(results, callback) {
                   
                    Page.findById(results[1].page, function(err, page) {
                        results.push(page);
                        callback(null, results);
                    });
                },

                function(results, callback) {
                   
                    PageTemplate.findOne({
                        'name': results[2].template
                    }, function(err, template) {
                        results.push(template);
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

                res.render('content/update', {
                    title: 'Update Content',
                    content: results[1],
                    page: results[2],
                    pageTemplate: results[3],
                    nav: results[0],
                    loggedIn: true,
                    siteConfig: results[4]
                });

            }
        )

    });


    app.post('/content/update', loggedIn, function(req, res) {

        var imgObj = null,
            PostParams = Object.keys(req.body),
            key_ary = [],
            img_name_ary = [],
            img_field_ary = [];

        //Get Form field names for file upload fields
        imgObj = JSON.stringify(req.files);
        imgObj = JSON.parse(imgObj);
        console.log(imgObj);

        for (var key in imgObj) {
            console.log(key);
            key_ary.push(key);
        }

        Content.findById(req.body.content_id, function(err, pageContent) {

            pageContent.id = req.body.content_id;
            pageContent.page = req.body.page_id;
            pageContent.update_dt = new Date();

            if (req.body.has_file == 'true') {

                for (i = 0; i < key_ary.length; i++) {

                    if (req.files[key_ary[i]] !== undefined) {
                        if (done == true) {

                            imgObj = JSON.stringify(req.files[key_ary[i]]);
                            imgObj = JSON.parse(imgObj);
                            img_name_ary.push(imgObj.name);
                            img_field_ary.push(imgObj.fieldname);

                        }
                    }
                }
            }

            PostParams.forEach(function(param) {

                if (param != 'page_id' && param != 'content_id') {
                    pageContent.customField(param, req.body[param]);
                }

                //add files that were uploaded to db custom fields
                for (i = 0; i < img_name_ary.length; i++) {
                    if (img_name_ary[i] !== undefined) {
                        pageContent.customField(img_field_ary[i], img_name_ary[i]);
                    }
                }

            });            

            pageContent.save(function(err, pageContent, count) {
                req.flash('info', 'Content Has been updated!')
                res.redirect('/content/manage/' + req.body.page_id);

            });

        });

    });

    app.post('/content/deleteimage', loggedIn, function(req, res) {

        fs.unlinkSync('uploads/' + req.body.file_name);

        

        Content.findById(req.body.content_id, function(err, pageContent) {

            var PostParams = Object.keys(req.body),
                properties = pageContent.customKeys,
                field_value = "";

            for (i = 0; i < properties.length; i++) {

                field_value = pageContent.customField(properties[i]);

                if (pageContent.customField(properties[i]) == req.body.file_name) {
                    console.log("Found Image to delete");

                    pageContent.customField(properties[i], null);
                    //pageContent.customField("has_file", false);

                }

            }
 
            pageContent.save(function(err, pageContent, count) {
                req.flash('info', 'Content Has been updated!')
                res.redirect('/content/manage/' + req.body.page_id);

            });

        });

    });

    app.get('/content/delete/:id', loggedIn, function(req, res) {

        async.series([

                //GET SITE CONFIG
                require('../get-site-config.js'),

                //GET SITE NAV FROM DATABASE
                require('../get-site-nav.js'),

                //GET ALL PAGE TEMPLATES 
                function(callback) {
                    Content.findById(req.params.id, function(err, pageContent) {
                        callback(null, pageContent);
                    });
                }
            ],

            //FINALLY RENDER PAGE TEMPLATES VIEW
            function(err, results) {
                res.render('content/delete', {
                    title: 'Delete Page Content',
                    pageContent: results[2],
                    nav: results[1],
                    loggedIn: true,
                    siteConfig: results[0]
                });
            }
        )

    });

    app.post('/content/delete/:id', loggedIn, function(req, res) {

        Content.findById(req.params.id, function(err, pageContent) {
            pageContent.remove(function(err, pageContent) {
                req.flash('info', 'Content Has been deleted!');
                res.redirect('/content/manage/' + pageContent.page);
            });
        });


    });

}