db = require('./db');
const passport = require('passport');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const path = require('path');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const fs = require('fs');
const flash = require('connect-flash');
const multer = require('multer');
const logger = require('./logger');
const app = express();
const engine = require('ejs-locals');
const global = require('./common/common.js');

domain = require('domain'),
    d = domain.create();

d.on('error', function (err) {
    logger.error(err);
});

app.use(session({
	secret: 'mySecretKey'
}));

app.use(passport.initialize());
app.use(passport.session());

// Initialize Passport
var initPassport = require('./passport/init');
initPassport(passport);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('ejs', engine);

app.use(function (req, res, next) {
	res.locals.role = req.session.role;
	next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));

app.use(cookieParser('mySecretKey'));
app.use(flash());

app.use(express.static(path.join(__dirname, 'public')));

/*Configure the multer.*/
app.use(multer({
	dest: './uploads/',
	rename: function (fieldname, filename) {
		return filename + Date.now();
	},
	onFileUploadStart: function (file) {
		logger.info(file.originalname + ' upload is starting')
	},
	onFileUploadComplete: function (file) {
		logger.info(file.fieldname + ' uploaded to  ' + file.path)
		done = true;
	}
}));

app.get('/*', global.getSiteConfig);
app.get('/*', global.getSiteNav);

var routes = require('./routes/index')(passport);

//Use routes in application
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;

	res.render('errors', {
		title: "Page Not Found",
		message: "The page you have requested is not available on this server",
		nav: null,
		loggedIn: false
	});
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function (err, req, res, next) {
		res.status(err.status || 500);
		logger.error(err.message);
		res.render('errors', {
			title: "Error",
			message: 'An error has occured on this page',
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
	res.status(err.status || 500);
	logger.error(err.message);
	res.render('errors', {
		message: 'An error has occured on this page',
		title: "Error",
		error: {}
	});
});

app.listen(3000, function () {
	console.log('server listening on port 3000');
});


module.exports = app;