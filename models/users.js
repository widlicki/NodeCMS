var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    email: String,
    password: String,
    login_attempts: Number,
    lock_until: Number
});

module.exports = mongoose.model('User', userSchema);