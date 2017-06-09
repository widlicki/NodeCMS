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

        console.log("in getSiteNav()");
        
        if (req.session.nav == undefined && req.session.role != undefined) {

            Page.find({
                'add_to_nav': true
            }, function (err, pages) {

                var navStr = "";
                var thisPageRole = "";
                var addToNav = false;
                
                console.log('req.session.role: ' + req.session.role);
                
                
                for (i = 0; i < pages.length; i++) {
                    
                    addToNav = false;
                    
                    thisPageRole = pages[i].role;
                    
                     
                    
                    if(req.session.role == 'admin'){
                        addToNav = true;
                    } else if (req.session.role == 'user' && thisPageRole == 'user'){
                        addToNav = true;
                    } else if (req.session.role == 'superUser' && (thisPageRole == 'user' || thisPageRole == 'superUser' )){
                        addToNav = true;
                    }
                    
                    if(addToNav){
                        navStr += '<li><a href="/site/' + pages[i].id + '">' + pages[i].name + '</a></li>'
                    }
                
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