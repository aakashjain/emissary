var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
	fbId: String,
	fbAccessToken: String,
	firstName: String,
	lastName: String
});

module.exports = mongoose.model('User', UserSchema);