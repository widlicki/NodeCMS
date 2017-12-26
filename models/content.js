const mongoose = require('mongoose');
const customFields = require('mongoose-custom-fields');

var contentSchema = mongoose.Schema({
	page : String,
	create_dt : Date,
	update_dt : Date,
	position: Number 
},{strict: false});

contentSchema.plugin(customFields);
module.exports = mongoose.model('Content', contentSchema);