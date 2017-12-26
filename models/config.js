var mongoose = require('mongoose');

var configSchema = mongoose.Schema({
	setup_config : String
});

module.exports = mongoose.model('Config', configSchema);