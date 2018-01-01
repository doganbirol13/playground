var express = require('express');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var db = require('./db');
var permit = require("./permissions");

// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.
passport.use(new Strategy(
  function(username, password, cb) {
    db.users.findByUsername(username, function(err, user) {
      if (err) { return cb(err); }
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
  db.users.findById(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});




// Create a new Express application.
var app = express();

//Define static sources
app.use(express.static(__dirname + '/public'));

// Configure view engine to render EJS templates.
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

// Define routes.
// app.get('/',
//   function(req, res) {
//     res.render('home', { user: req.user });
//   });

app.get('/',
  function(req, res){
    res.render('login');
  });

app.get('/login',
  function(req, res){
    res.render('login');
  });
  
app.post('/login', 
  passport.authenticate('local', { session: 'true', failureRedirect: '/' }),
  function(req, res) {
    if(req.user.username == 'jll'){
    res.redirect('/index');
    }
    else{
      res.redirect('/index2');
    }
  });
  
app.get('/logout',
  function(req, res){
    req.logout();
    res.redirect('/');
  });

//Role based routing, it worked, the commented below lines are backups


app.get("/index", permit("default"), function(req, res){res.render('index', { user: req.user });});              //(req, res) => req.json({currentUser: request.user}))
app.get("/index2", permit("first"), function(req, res){res.render('index2', { user: req.user });});



//app.use("/views/perm", permit("default"));
// app.get('/index',
//   require('connect-ensure-login').ensureLoggedIn(),
//   function(req, res){
//     res.render('index', { user: req.user });
//   });

//Define the second role based routing for another page


app.listen(3000);