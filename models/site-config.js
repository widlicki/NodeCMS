const mongoose = require('mongoose');

const siteSchema = mongoose.Schema({
	site_name : String,
	home_page : String,
	disable_new_users : String,
	setup_wizard: String   
});

module.exports = mongoose.model('Site', siteSchema);