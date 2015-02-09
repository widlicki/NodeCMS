var mongoose = require('mongoose')
    customFields = require('mongoose-custom-fields');

var contentSchema = mongoose.Schema({

     page : String,
     create_dt : Date,
     update_dt : Date
     
 },{strict: false});

contentSchema.plugin(customFields);
module.exports = mongoose.model('Content', contentSchema);