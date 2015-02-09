var mongoose = require('mongoose');
mongoose.connect( 'mongodb://localhost/node_cms' );
module.exports = mongoose.connection;