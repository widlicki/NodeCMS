var Site = require('./models/site-config');

module.exports = function (callback ){
 
    Site.findOne(function(err, siteConfig) {
             
    	if(siteConfig == null){
                            
            siteConfig = new Site({
                               
                _id: undefined,
				site_name: "",
				home_page: "",
				disable_new_users: ""

			});
		} 

       console.log(siteConfig);

         callback(null, siteConfig);
    
    });
 
}