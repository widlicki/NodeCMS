var mongoose = require('mongoose');

var pageTemplateSchema = mongoose.Schema({

     name : String,
     description : String,
     field_list: String
 
});

module.exports = mongoose.model('PageTemplate', pageTemplateSchema);