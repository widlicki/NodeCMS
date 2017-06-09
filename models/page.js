var mongoose = require('mongoose');

var pageSchema = mongoose.Schema({

     name : String,
     description : String,
     template: String,
     add_to_nav: Boolean,
     contenthtml: String,
     //thumb_width: Number,
     //thumb_height: Number,
     formhtml: String,
     searchable: Boolean,
     role: String
 
});

module.exports = mongoose.model('Page', pageSchema);