var mongoose = require('mongoose');
//var dbURI = 'mongodb://nodecms:nodecms@ds139959.mlab.com:39959/node_cms';

mongoose.connect( 'mongodb://nodecms:nodecms@ds139959.mlab.com:39959/node_cms' );
module.exports = mongoose.connection;
