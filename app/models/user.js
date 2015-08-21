var mongoose = require('mongoose');
var Trip = require('./trip.js');

var UserSchema = new mongoose.Schema({
	fbId: String,
	token: String,
	firstName: String,
	lastName: String,
	photo: String,
	totalEmission: Number,
	trips: [Trip.schema]
});

module.exports = mongoose.model('User', UserSchema);