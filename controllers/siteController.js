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
    mongoose.Promise = Promise;


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


module.exports = {

    getImages: function (req, res) {

        res.sendFile(path.resolve('./uploads/' + req.params.file_name));

    },

    siteSearch: function (req, res) {

        var search_field = req.body.search_field,
            search_value = req.body.search_value,
            search_page = req.body.page,
            page = null,
            templates = null,
            content = null,
            customFields = null,
            contentKeys = null,
            allContent = "";


        Page.findById(search_page)
            .then(function (page) {
                var result = [];
                result.push(page);
                return result;
            })

        .then(function (result) {

                return Content.find({
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
                    })
                    .then(function (content) {

                        allContent = parseContent(result[0], content)
                        result.push(allContent);

                        return result;
                    });

            })
            .then(function (result) {

                res.render('site/content', {
                    title: 'Content',
                    page: result[0],
                    content: result[1],
                    nav: req.session.nav,
                    searchFields: null,
                    loggedIn: true,
                    siteConfig: req.session.siteConfig
                });


            })
            .then(undefined, function (err) {

                console.log(err);
            })

    },


    getSite: function (req, res) {


        var page = null;
        var templates = null;
        var content = null;
        var customFields = null;
        var contentKeys = null;
        var allContent = "";

        var siteNav = req.session.nav;


        Page.findById(req.params.id)
            .then(function (page) {
                var result = [];
                var authorized = false;
                var thisPageRole = page.role;

                if (req.session.role == 'admin') {
                    authorized = true;
                } else if (req.session.role == 'user' && thisPageRole == 'user') {
                    authorized = true;
                } else if (req.session.role == 'superUser' && (thisPageRole == 'user' || thisPageRole == 'superUser')) {
                    authorized = true;
                }

                if (!authorized) {
                    throw new Error();
                }


                return [req.session.nav, page];
            })
            .then(function (result) {
                return Content.find({
                        'page': req.params.id
                    })
                    .then(function (pageContents) {

                        allContent = parseContent(result[1], pageContents)
                        result.push(allContent);

                        return result;
                    });
            })
            .then(function (result) {
                var page = result[1];
                if (page.searchable) {

                    return PageTemplate.findOne({
                            'name': page.template
                        })
                        .then(function (pageTemplate) {

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

                            result.push(field_ary);



                            return result;
                        })
                } else {
                    return result;
                }
            })
            .then(function (result) {
                var loggedIn = false;


                res.render('site/content', {
                    title: 'Content',
                    page: result[1],
                    content: result[2],
                    nav: result[0],
                    searchFields: result[3],
                    loggedIn: true,
                    siteConfig: req.session.siteConfig

                });
            })
            .then(undefined, function (err) {

                console.log(err);

                res.render('errors', {
                    title: 'An Error has occured',
                    message: 'An Error has occured',
                    nav: req.session.nav,
                    loggedIn: true,
                    siteConfig: req.session.siteConfig
                });
            })

    }

}