var mongoose = require('mongoose'),
    Site = require('../models/site-config');

module.exports = {

        getHomepage: function (req, res) {
  
        console.log("getting homepage");    
            
        Site.findOne(function (err, siteConfig) {

            if (err) {
                console.log("Error finding Site Config");
                return;
            } else {
                console.log('redirecting');
                res.redirect('/site/' + siteConfig.home_page);
            }

        });
        }

}