var express = require('express');
var path = require('path');
var session = require('express-session');
var mongoose = require('mongoose');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var fbConfig = require('./fbConfig.js');
var request = require('request');
var cheerio = require('cheerio');
var User = require('./app/models/user.js');

mongoose.connect('mongodb://localhost:27017/emissary');

passport.serializeUser(function(user, done) {
	done(null, user);
});
passport.deserializeUser(function(user, done) {
	done(null, user);
});

passport.use(new FacebookStrategy({
		clientID: fbConfig.clientID,
		clientSecret: fbConfig.clientSecret,
		callbackURL: fbConfig.callbackURL,
		profileFields: ['id', 'name', 'photos']
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
						token: accessToken,
						firstName: profile.name.givenName,
						lastName: profile.name.familyName,
						photo: profile.photos[0].value
					});
					newUser.save(function(err) {
						if(err) {
							console.log(err);
						} else {
							done(null, newUser);
						}
					});
				}
			});
		});
	}
));

var app = express();
app.use(express.static(__dirname + '/public'));
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(session({
	secret: '(/ ͡° ͜ʖ ͡°)/*~~~~~~',
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/auth', passport.authenticate('facebook'));

app.get('/auth/callback', passport.authenticate('facebook', { failureRedirect: '/' }), function(req, res) {
	res.redirect('/dash');
});

var checkAuth = function(req, res, next) {
	if(req.isAuthenticated())
		return next();
	else
		res.redirect('/');
}

var apiRouter = express.Router();

apiRouter.use(function(req, res, next) {
	if(req.isAuthenticated())
		return next();
	else
		res.redirect('/');
});

apiRouter.get('/user', function(req, res) {
	res.json(req.user);
});

apiRouter.post('/newtrip', function(req, res) {
	switch(req.body.mode) {
		case 'car':
			res.redirect('/car');
		break;

		case 'plane':
			res.redirect('/plane');
		break;

		case 'public':
			res.redirect('/public');
		break;
	}
});

apiRouter.post('/savetrip', function(req, res) {
	var trip = new Trip({
		src: req.body.src,
		dest: req.body.dest,
		distance: req.body.distance,
		mode: req.body.mode,
		emission: req.body.emission
	});
	req.user.trips.push(trip.toObject());
	req.user.save(function(err) {
		if(err)
			console.log(err);
	});
});

apiRouter.get('/scrape', function(req, res) {
	var url = "http://impact.brighterplanet.com/" + req.query.url;
	request(url, function(error, response, html) {
		if(error)
			console.log(error);
		else {
			var value = (cheerio.load(html))('.report').first().text().split('\n')[1].trim();
			var report = {emission: value};
			res.json(report);
		}
	});
});

app.use('/api', apiRouter);

app.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});

app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname + '/public/app/views/index.html'))
});

app.get('*', checkAuth, function(req, res) {
	res.sendFile(path.join(__dirname + '/public/app/views/index.html'));
});

app.listen(process.env.PORT || 8000);