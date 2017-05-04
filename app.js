db = require('./db');
var passport = require('passport'),
    express = require('express'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session),
    path = require('path'),
    favicon = require('serve-favicon'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    flash = require('connect-flash'),
    multer = require('multer'),
    logger = require('./logger'),
    app = express(),
    engine = require('ejs-locals'),
    global = require('./common/common.js');


domain = require('domain'),
    d = domain.create();

d.on('error', function (err) {
    console.error(err);
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

//app.use(session({
//    secret: 'magda',
//    resave: false,
//    saveUninitialized: true,
//    cookie: {
//        maxAge: 3600000
//    },
//    store: new MongoStore({
//        mongooseConnection: db
//    })
//}));



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
        console.log(file.originalname + ' is starting ...')
    },
    onFileUploadComplete: function (file) {
        console.log(file.fieldname + ' uploaded to  ' + file.path)
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
    // next(err);

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