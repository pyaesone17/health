var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var dbcon = require('./database/connection')
var sequelize = require('sequelize')
var User = require('./models/user')(dbcon,sequelize)

var seed = require('./seeders/record-seed');
var seed2 = require('./seeders/record-seed-2');

var monitor = require('./routes/monitor');

var monitor = require('./routes/monitor');
var users = require('./routes/users');
var health = require('./routes/health');
var auth = require('./routes/auth')
var me = require('./routes/me/index')

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var schdueler = require('./scheduler/index')

schdueler.job()
// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.
passport.use(new LocalStrategy(
  function(username, password, cb) {
    User.findOne({ where: {"username": username} }).then(user => {
      if (!user) { return cb(null, false); }
      if (user.password != password) { return cb(null, false); }
      return cb(null, user);
    });
}));


// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  User.findById(id).then(user => {
    if (user===null) { return cb("Not found"); }
    cb(null, user);
  });
});


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');

app.use(require('express-session')({
  secret: 'secret-key',
  cookie : {
    expires: false
  },
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(function (req, res, next) {
  res.locals = {
    user: req.user
  };
  next();
});

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));

app.use('/', auth);
app.use('/me',me);
app.use('/backend/users', users);
app.use('/backend/monitor',monitor);
app.use('/backend/health',health);
app.use('/auth',auth);

app.use('/seed/1', function(){
  seed()
});

app.use('/seed/2', function(){
  seed2()
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
