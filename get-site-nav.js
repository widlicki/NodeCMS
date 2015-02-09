var Page = require('./models/page');

module.exports = function (callback ){

    Page.find( {'add_to_nav' : true}, function ( err, pages ){
             
          var navStr = "";
         
          for(i=0; i<pages.length; i++){
              
              navStr += '<li><a href="/site/'+pages[i].id+'">'+pages[i].name+'</a></li>'
          
          } 
                
          callback(null, navStr);
    });

}