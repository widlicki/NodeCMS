var mongoose = require('mongoose');
//var dbURI = 'mongodb://nodecms:nodecms@ds139959.mlab.com:39959/node_cms';
mongoose.connect( 'mongodb://nodecmsuser:nodecmsuser@ds111876.mlab.com:11876/nodecms' );
module.exports = mongoose.connection;
