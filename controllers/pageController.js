var mongoose = require('mongoose'),
    Page = require('../models/page'),
    PageTemplate = require('../models/page-template'),
    async = require('async');

module.exports = {


    getPages: function (req, res) {

        Page.find(function (err, pages, count) {
            res.render('page', {
                title: 'Manage Pages',
                message: req.flash('info'),
                pages: pages,
                nav: req.session.nav,
                loggedIn: true,
                siteConfig: req.session.siteConfig
            });
        });

    },

    createPage: function (req, res) {

        PageTemplate.find(function (err, pageTemplates, count) {
            res.render('page/create', {
                title: 'Add Page',
                pageTemplates: pageTemplates,
                nav: req.session.nav,
                loggedIn: true,
                siteConfig: req.session.siteConfig
            });
        });

    },

    doCreatePage: function (req, res) {

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
            searchable: searchable,
            role: req.body.role
            

        }).save(function (err, Page, count) {

            req.flash('info', 'Page has been created!');
            res.redirect('/pages');

        });

    },

    updatePage: function (req, res) {

        
        Page.findById(req.params.id)
            .then(function (page) {
                var result = [];
                return [req.session.nav, page];
            })
            .then(function(result){
                 
                return PageTemplate.find()
                    .then(function (pageTemplates) {
 
                        result.push(pageTemplates);

                        return result;
                    });
            
            })
            .then(function(result){
            
                 res.render('page/update', {
                    title: 'Update Page',
                    page: result[1],
                    pageTemplates: result[2],
                    nav: result[0],
                    loggedIn: true,
                    siteConfig: req.session.siteConfig
                });
            
            })
            .then(undefined, function (err) {

                console.log(err);
            })
         
    },

    doUpdatePage: function (req, res) {


        Page.findById(req.params.id, function (err, page) {

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

            page.role = req.body.role;
            
            page.save(function (err, page, count) {

                req.flash('info', 'Page has been updated!');
                res.redirect('/pages');

            });
        });

    },

    deletePage: function (req, res) {

        Page.findById(req.params.id, function (err, page) {
            res.render('page/delete', {
                title: 'Delete Page',
                page: page,
                nav: req.session.nav,
                loggedIn: true,
                siteConfig: req.session.siteConfig
            });
        });

    },

    doDeletePage: function (req, res) {

        Page.findById(req.params.id, function (err, page) {

            page.remove(function (err, page) {
                req.flash('info', 'Page Has been deleted!');
                res.redirect('/pages');
            });

        });

    },

    getTemplateFieldsByName: function (req, res) {

        PageTemplate.findOne({
            'name': req.params.name
        }, function (err, pageTemplate) {
            console.log(pageTemplate);
            res.send(pageTemplate);
            return;
        });

    }


}