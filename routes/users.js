const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const multer = require('multer');
fs = require('fs-extra');

// Upload imgs
let uploadimg = require('../models/imgs');

// Bring in User Model
let User = require('../models/user');

// Article Model
let Blogs = require('../models/blog');

// Comment Model
let Comment = require('../models/comment');

// Register Form
router.get('/register', function(req, res){
  res.render('register');
});

// List user
router.get('/list', ensureAuthenticated, function(req, res){
  User.find({}, function(err, user){
    if(err){
      console.log(err);
      
    } else {        
      res.render('user_list', {
        author:user
    });
    }
  });
});

// Delete users
router.post('/del/:id', function(req, res){

  let query = {_id:req.params.id}

  User.findById(req.params.id, function(err, user){
    Blogs.find({author:req.params.id}, function(err, blog){
      Comment.find({blogid:blog._id}, function(err, comment){
        Comment.find({author:req.params.id}, function(err, comments){
          if (req.user.status === 'admin'){
            User.remove(query, function(err){
              Blogs.remove({author:req.params.id}, function(err){
                Comment.remove({blogid:req.params.id}, function(err){
                  Comment.remove({author:req.params.id}, function(err){
                    if(err){
                      console.log(err);
                    }
                    res.redirect('/users/list');
                  });
                });
              });
            });
          } else {
            res.status(500).send();
          }
        });
      });
    });
  });
});

// Register Proccess
router.post('/register', uploadimg.upload.single('image'), function(req, res){
  var imgfile = uploadimg.upIMG(req, res);
  const fname = req.body.fname;
  // const lname = req.body.lname;
  const email = req.body.email;
  const phone = req.body.phone;
  const username = req.body.username;
  const password = req.body.password;
  const password2 = req.body.password2;
  const status = 'users';
  const image = imgfile;
  const bio = 'Welcome to wisg';

  req.checkBody('fname', 'first_name is required').notEmpty();
  // req.checkBody('image', 'image is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('phone', 'Phone is required').notEmpty();
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

  let errors = req.validationErrors();

  if(errors){
    req.flash('danger','Sign Up fail');
    res.redirect('/users/register');
  } else {
    let newUser = new User({
      fname:fname,
      email:email,
      phone:phone,
      username:username,
      password:password,
      status:status,
      image:image,
      bio:bio
    });

    bcrypt.genSalt(10, function(err, salt){
      bcrypt.hash(newUser.password, salt, function(err, hash){
        if(err){
          console.log(err);
        }
        newUser.password = hash;
        newUser.save(function(err){
          if(err){
            console.log(err);
            res.redirect('/users/register');
            // return;
          } else {
            req.flash('success','You are now registered and can log in');
            res.redirect('/users/login');
          }
        });
      });
    });
  }
});
// Load Edit Form:User
router.get('/edit_user/:id', ensureAuthenticated, function(req, res){
  User.findById(req.params.id, function(err, user){
    if(user._id != req.params.id){
      res.redirect('/');
    }
    res.render('edit_user', {
      user:user
    });
  });
});

// Update Submit POST Route:User
router.post('/edit_user/:id', uploadimg.upload.single('image'), function(req, res){
  var editfile = uploadimg.upIMG(req, res);
  let user = {};
  user.fname = req.body.fname;
  // blog.author = req.body.author;
  // user.email = req.body.email;
  user.phone = req.body.phone;
  user.bio = req.body.bio;

  if(editfile != false){
    user.image = editfile;
  }
  let query = {_id:req.params.id}

  User.update(query, user, function(err){
    if(err){
      console.log(err);
      return;
    } else {
      // req.flash('success', 'User Updated');
      res.redirect('/blogs/profile/'+req.params.id);
    }
  });
});

// Login Form
router.get('/login', function(req, res){
  res.render('login');
});

// Login Process
router.post('/login', function(req, res, next){
  passport.authenticate('local', {
    successRedirect:'/',
    failureRedirect:'/users/login',
    failureFlash: true
  })(req, res, next);
});

// logout
router.get('/logout', function(req, res){
  req.logout();
  // req.flash('success', 'You are logged out');
  res.redirect('/');
});

// Access Control
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    req.flash('danger', 'Please login');
    res.redirect('/users/login');
  }
}

module.exports = router;
