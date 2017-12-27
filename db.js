var mongoose = require('mongoose');
mongoose.connect( 'mongodb://<username>:<password>@ds999999.mlab.com:11876/nodecms' );
module.exports = mongoose.connection;
