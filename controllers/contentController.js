var mongoose = require('mongoose'),
    Page = require('../models/page'),
    PageTemplate = require('../models/page-template'),
    Content = require('../models/content'),
    customFields = require('mongoose-custom-fields'),
    global = require('../common/common.js'),
    fs = require('fs'),
    async = require('async'),
    Site = require('../models/site-config');

module.exports = {


    getContent: function (req, res) {

        Page.find(function (err, pages) {
            res.render('content', {
                title: 'Manage Content',
                pages: pages,
                nav: req.session.nav,
                loggedIn: true,
                siteConfig: req.session.siteConfig
            });
        });

    },



    manageContentById: function (req, res) {

        async.series([

                //GET ALL PAGE INFO 
                function (callback) {
                    Page.findById(req.params.id, function (err, page) {
                        callback(null, page);
                    });
                },

                //GET ALL PAGE CONTENT
                function (callback) {
                    Content.find({
                        'page': req.params.id
                    }, function (err, pageContents) {
                        callback(null, pageContents);
                    });
                }

            ],

            //FINALLY RENDER CONTENT VIEW
            function (err, results) {

                var page = results[0],
                    content = results[1],
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
                    nav: req.session.nav,
                    loggedIn: true,
                    siteConfig: req.session.siteConfig
                });

            }
        )

    },


    createContent: function (req, res) {

        Page.findById(req.params.id)
            .then(function (page) {
                var result = [];
                result.push(page);
                return result;
            })
            
            .then(function (result) {

                return PageTemplate.findOne({
                        'name': result[0].template
                    })
                    .then(function (pageTemplate) {

                        result.push(pageTemplate);
                        return result;
                    });

            })
            .then(function (result) {

               res.render('content/create', {
                    title: 'Create Content',
                    page: result[0],
                    pageTemplate: result[1],
                    nav: req.session.nav,
                    loggedIn: true,
                    message: req.flash('info'),
                    siteConfig: req.session.siteConfig
                });

            })
            .then(undefined, function (err) {

                console.log(err);
            })
        
        
         

    },


    doCreateContent: function (req, res) {

        PageTemplate.findById(req.body.page_template_id, function (err, pageTemplate) {

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

            PostParams.forEach(function (param) {

                if (param != 'page_id' && param != 'page_template_id') {

                    var passedValidation = true;


                    //Check if required fields have values
                    fieldObj.fields.forEach(function (field) {

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

                content.save(function (err) {
                    req.flash('info', 'Content Has been added!')
                    res.redirect('/content/manage/' + req.body.page_id);

                });
            } else {
                req.flash('info', thisField + " is a required field!");
                res.redirect('/content/create/' + req.body.page_id);
            }
        });

    },

    updateContent: function (req, res) {

        Content.findById(req.params.id)
            .then(function (content) {
                var result = [];
                result.push(content);
                return result;
            })
            .then(function (result) {

                return Page.findById(
                        result[0].page
                    )
                    .then(function (page) {

                        result.push(page);
                        return result;
                    });

            })
            .then(function (result) {

                return PageTemplate.findOne({
                        'name': result[1].template
                    })
                    .then(function (pageTemplate) {

                        result.push(pageTemplate);

                        return result;
                    });

            })
            .then(function (result) {

                res.render('content/update', {
                    title: 'Update Content',
                    content: result[0],
                    page: result[1],
                    pageTemplate: result[2],
                    nav: req.session.nav,
                    loggedIn: true,
                    siteConfig: req.session.siteConfig
                });

            })
            .then(undefined, function (err) {

                console.log(err);
            })
 

    },

    doUpdateContent: function (req, res) {

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

        Content.findById(req.body.content_id, function (err, pageContent) {

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

            PostParams.forEach(function (param) {

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

            pageContent.save(function (err, pageContent, count) {
                req.flash('info', 'Content Has been updated!')
                res.redirect('/content/manage/' + req.body.page_id);

            });

        });

    },

    deleteImage: function (req, res) {

        fs.unlinkSync('uploads/' + req.body.file_name);

        Content.findById(req.body.content_id, function (err, pageContent) {

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

            pageContent.save(function (err, pageContent, count) {
                req.flash('info', 'Content Has been updated!')
                res.redirect('/content/manage/' + req.body.page_id);

            });

        });

    },

    deleteContent: function (req, res) {

        Content.findById(req.params.id, function (err, pageContent) {
            res.render('content/delete', {
                title: 'Delete Page Content',
                pageContent: pageContent,
                nav: req.session.nav,
                loggedIn: true,
                siteConfig: req.session.siteConfig
            });
        });

    },

    doDeleteContent: function (req, res) {

        Content.findById(req.params.id, function (err, pageContent) {
            pageContent.remove(function (err, pageContent) {
                req.flash('info', 'Content Has been deleted!');
                res.redirect('/content/manage/' + pageContent.page);
            });
        });
    }




}