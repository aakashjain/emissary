var mongoose = require('mongoose');

var TripSchema = new mongoose.Schema({
	src: String,
	dest: String,
	distance: Number,
	mode: String,
	emission: Number
});

module.exports = mongoose.model('Trip', TripSchema);