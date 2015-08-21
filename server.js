var express = require('express');
var app = express();
var path = require('path');
var mongoose = require('mongoose');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var fbConfig = require('./fbConfig.js');
var User = require('./app/models/user.js')

app.use(express.static(__dirname + '/public'));
app.use(require('body-parser').urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/emissary');

passport.serializeUser(function(user, done) {
	done(null, user);
});
passport.deserializeUser(function(obj, done) {
	done(null, obj);
});
passport.use(new FacebookStrategy({
		clientID: fbConfig.clientID,
		clientSecret: fbConfig.clientSecret,
		callbackURL: fbConfig.callbackURL
	},
	function(accessToken, refreshToken, profile, done) {
		process.nextTick(function() {
			User.findOne({ fbId: profile.id }, function(err, user) {
				if(err) {
					console.log(err);
				} else if(user) {
					done(null, user);
				} else {
					var newUser = new User({
						fbId: profile.id,
						fbAccessToken: accessToken,
						firstName: profile.name.givenName,
						lastName: profile.name.familyName
					});
					newUser.save(function(err) {
						if(err) {
							console.log(err);
						} else {
							done(null, newUser);
						}
					})
				}
			});
		});
	}
));

app.use(passport.initialize());
app.use(passport.session());

app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname + '/public/app/views/index.html'));
});

app.get('/auth', passport.authenticate('facebook'));

app.get('/auth/callback', passport.authenticate('facebook', { failureRedirect: '/' }), function(req, res) {
	res.redirect('/user');
});

app.listen(process.env.PORT || 8000);