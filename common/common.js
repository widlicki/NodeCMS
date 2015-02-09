var mongoose = require('mongoose')
var Page = require('../models/page');

module.exports = {

    //Creates object bases on custom fields defined in page templates
    parseCustomFields: function(reqBody) {

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

    getSiteNav: function(callback) {

         

        Page.find({'add_to_nav': true}, function(err, pages) {

            var navStr = "";

            for (i = 0; i < pages.length; i++) {
                navStr += '<li><a href="/site/' + pages[i].id + '">' + pages[i].name + '</a></li>'
            }
             
 
            callback(null, navStr);
        });

         

    }

}