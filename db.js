var mongoose = require('mongoose');
mongoose.connect( 'mongodb://<username>:<password>@<dbpath>' );
module.exports = mongoose.connection;
