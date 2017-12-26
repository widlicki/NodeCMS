const mongoose = require('mongoose');

const pageTemplateSchema = mongoose.Schema({
	name : String,
	description : String,
	field_list: String
});

module.exports = mongoose.model('PageTemplate', pageTemplateSchema);