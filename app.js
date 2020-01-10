const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');

const portnumber = process.env.PORT || 9000

mongoose.connect(config.database);
let db = mongoose.connection;

//check con.
db.once('open',function(){
  console.log('Connected db Success');
});

//check for Db errors
db.on('error',function(err){
  console.log(err);
})

//init app 
const app = express();

//bring in models
let Blogs = require('./models/blog');

//Load View Engine
// app.set('view',path.join(__dirname,'view'));
app.set('view engine','ejs');

// Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));


// Express Session Middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express Validator Middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Passport Config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
  res.locals.user = req.user || null;
  next();
});

// Home Route
app.get('/', function(req, res){
  Blogs.find({}, function(err, blogs){
    Blogs.find({},null,{sort: {view: -1},limit: 4},(err, most) => {
      Blogs.find({},null,{sort: {created: -1},limit: 6},(err, news) => {
        if(err){
          console.log(err);
        } else {
          res.render('index', {
          blogs: blogs,
          most: most,
          news:news
        });
        }
      });
    });
  });
});

// About 
app.get('/about', function(req, res){
  Blogs.find({},null,{sort: {view: -1},limit: 4},(err, most) => {
    Blogs.find({},null,{sort: {created: -1},limit: 4},(err, news) => {
      if (err){
        console.log(err);
      } else {
        res.render('about',{
          most: most,
          news: news
        });
      }
    });
  });
});

// Route Files
let blogs = require('./routes/blogs');
let users = require('./routes/users');
app.use('/blogs', blogs);
app.use('/users', users);

// Start Server
app.listen(portnumber, function(){
  console.log('Server started port 3000');
});


