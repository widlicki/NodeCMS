var mongoose = require('mongoose')
var Page = require('../models/page');
var Site = require('../models/site-config');


module.exports = {

    //Creates object bases on custom fields defined in page templates
    parseCustomFields: function (reqBody) {

        var formFieldData = {
            fields: []
        };

        var paramName = "";
        var paramType = "";

        for (var i = 1; i < 9; i++) {

            paramName = "fname" + i.toString();
            paramType = "ftype" + i.toString();
            paramData = "fdata" + i.toString();
            paramReq = "freq" + i.toString();
            paramSearch = "fsearch" + i.toString();

            if (reqBody[paramName] !== "") {
                jsonData = {};
                jsonData["name"] = reqBody[paramName];
                jsonData["type"] = reqBody[paramType];
                jsonData["class"] = reqBody[paramName].replace(" ", "-").toLowerCase();
                jsonData["data"] = reqBody[paramData];
                jsonData["req"] = reqBody[paramReq];
                jsonData["search"] = reqBody[paramSearch];
                formFieldData.fields.push(jsonData);
            }
        }

        return formFieldData;

    },

    getSiteNav: function (req, res, next) {

        if (req.session.nav == undefined) {

            Page.find({
                'add_to_nav': true
            }, function (err, pages) {

                var navStr = "";

                for (i = 0; i < pages.length; i++) {
                    navStr += '<li><a href="/site/' + pages[i].id + '">' + pages[i].name + '</a></li>'
                }

                req.session.nav = navStr;

                next();

            });

        } else {

            next();
        }

    },

    getSiteConfig: function (req, res, next) {

        Site.findOne(function (err, siteConfig) {

            if (siteConfig == null) {
                siteConfig = new Site({
                    _id: undefined,
                    site_name: "",
                    home_page: "",
                    disable_new_users: ""
                });
            }

            req.session.siteConfig = siteConfig;
            next();
        });

    }


}