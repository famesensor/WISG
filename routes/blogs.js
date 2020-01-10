const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs-extra');

const MongoClient = require('mongodb').MongoClient;
ObjectId = require('mongodb').ObjectId;

const myurl = 'mongodb+srv://fame:'+encodeURIComponent('fame')+'@wdb-3q7ow.mongodb.net/test?retryWrites=true';
// const myurl = 'mongodb://localhost:27017/';
const dbname = 'test';

MongoClient.connect(myurl, (err, client) => {
    if (err) return console.log(err);
    db = client.db(dbname);
});

// Upload imgs
let uploadimg = require('../models/imgs');
// Article Model
let Blogs = require('../models/blog');
// User Model
let User = require('../models/user');
// Comment Model
let Comment = require('../models/comment');

// Profile Route
router.get('/profile/:id', ensureAuthenticated, function(req, res){
  User.findById(req.user._id, function(err, user){
    User.findById(req.params.id, function(err, users){
      Blogs.find({author:users.id}, function(err, blog){
        if(err){
          console.log(err);
        } else {
          res.render('profile', {
            user:user,
            blog:blog,
            users:users
          });
        }
      });
    });
  });
});

// Add Route
router.get('/add', ensureAuthenticated, function(req, res){
      Blogs.find({},null,{sort: {view: -1},limit: 4},(err, most) => {
        if(err){
          console.log(err);
        } else {
          res.render('addblog', {
            most: most
          });
        }
      });
  });

// Add Submit POST Route
router.post('/add', uploadimg.upload.single('image'), function(req, res){

    req.checkBody('title','Title is required').notEmpty();
    req.checkBody('category','Category is required').notEmpty();
    //req.checkBody('author','Author is required').notEmpty();
    req.checkBody('body','Body is required').notEmpty();

    // Get Errors
  let errors = req.validationErrors();
  var imgfile = uploadimg.upIMG(req, res);
  // var img = fs.readFileSync(req.file.path);
  // var encode_image = img.toString('base64');


  if(errors){
    req.flash('danger','Post Blog fail');
    res.redirect('/blogs/add');
    } else {
      let newblog = new Blogs();
      newblog.title = req.body.title;
      newblog.author = req.user._id;
      newblog.category = req.body.category;
      newblog.body = req.body.body;
      newblog.image = imgfile;
      // newblog.image.filename = req.file.filename;
      // newblog.image.data = new Buffer(encode_image, 'base64');
      // newblog.image.contentType = req.file.mimetype;

    newblog.save(function(err){
      if(err){
        console.log(err);
        return;
      } else {
        // req.flash('success','Blog Added');
        res.redirect('/');
      }
    });
  }
});



// Load Edit Form
router.get('/edit/:id', ensureAuthenticated, function(req, res){
    Blogs.findById(req.params.id, function(err, blog){
      if(blog.author != req.user._id){
        req.flash('danger', 'Not Authorized');
        res.redirect('/');
      }
      res.render('edit_blog', {
        title:'Edit blog',
        blog:blog
      });
    });
});

// Update Submit POST Route
router.post('/edit/:id', uploadimg.upload.single('image'), function(req, res){
    var editfile = uploadimg.upIMG(req, res);
    let blog = {};
    blog.title = req.body.title;
    // blog.author = req.body.author;
    blog.category = req.body.category;
    blog.body = req.body.body;

    if(editfile != false){
      blog.image = editfile;
    }
    let query = {_id:req.params.id}

    Blogs.update(query, blog, function(err){
      if(err){
        console.log(err);
        return;
      } else {
        // req.flash('success', 'Blog Updated');
        res.redirect('/blogs/'+req.params.id);
      }
    });
  });

// Comment Submit POST Route
router.post('/comment/:id', function(req, res){
  let comment = new Comment();
  comment.comment = req.body.comment;
  comment.author = req.user._id;
  comment.namec = req.user.fname;
  comment.blogid = req.params.id;

  Blogs.update({_id: req.params.id}, {$inc: {comments: true}}, {}, (err, numberAffected) => {
  });
    comment.save(function(err){
    if(err){
      console.log(err);
        return;
    } else {
      // req.flash('success','Comment Added');
      res.redirect('/blogs/'+req.params.id);
    }
  });;
});
// All blogs
router.get('/allblog', function(req, res){
  Blogs.find({}, function(err, blog){
    Blogs.find({},null,{sort: {view: -1},limit: 4},(err, most) => {
        res.render('allblog', {
          blog: blog,
          most: most
      });
    });
  });
});



// Delete blog
router.post('/:id', function(req, res){
    if(!req.user._id){
      res.status(500).send();
    }

    let query = {_id:req.params.id}

    Blogs.findById(req.params.id, function(err, blog){
      Comment.find({blogid:blog._id}, function(err, comment){
        if(blog.author == req.user._id){
          Blogs.remove(query, function(err){
            Comment.remove({blogid:req.params.id}, function(err){
              if(err){
                console.log(err);
              }
              res.redirect('/');
            });
          });
        } else if (req.user.status === 'admin'){
          Blogs.remove(query, function(err){
            Comment.remove({blogid:req.params.id}, function(err){
              if(err){
                console.log(err);
              }
              res.redirect('/');
            });
          });
        } else {
          res.status(500).send();
        }
      });  
    });
});

// Delete Comment
router.post('/del/:id_blog/:id', function(req, res){
  if(!req.user._id){
    res.status(500).send();
  }

  let query = {_id:req.params.id}
  
  Comment.findById(req.params.id, function(err, comment){
    if(comment.author == req.user._id){
      Comment.remove(query, function(err){
        Blogs.update({_id: req.params.id_blog},{$inc: { comments: -1 }}, function(err, blog){
          if(err){
            console.log(err);
          }
          res.redirect('/blogs/'+req.params.id_blog);
        });
      });
    } else if(req.user.status === 'admin') {
      Comment.remove(query, function(err){
        Blogs.update({_id: req.params.id_blog},{$inc: { comments: -1 }}, function(err, blog){
          if(err){
            console.log(err);
          }
          res.redirect('/blogs/'+req.params.id_blog);
        });
      });
    } else {
      res.status(500).send();
    }
  });
});

// Get Single blog
router.get('/:id', function(req, res){
  Blogs.findById(req.params.id, function(err, blog){
    Blogs.find({},null,{sort: {view: -1},limit: 4},(err, most) => {
      Blogs.find({},null,{sort: {created: -1},limit: 4},(err, news) => {
        User.findById(blog.author, function(err, user){
          Comment.find({blogid:req.params.id}, function(err, comment){
            Blogs.update({_id: req.params.id}, {$inc: {view: true}}, {}, (err, numberAffected) => {
              res.render('single_blog', {
                blog: blog,
                author: user,
                comment: comment,
                most: most,
                news: news
              });
            });
          });
        });
      });
    });
  });
});

// Catagory get
router.get('/category/:name_c', function(req, res){
  let name = req.params.name_c;
  Blogs.find({category:name}, function(err, cat){
    Blogs.find({},null,{sort: {view: -1},limit: 4},(err, most) => {
      if (err){
        console.log(err);
      } else {
        res.render('category',{
          cat: cat,
          most: most,
          name: name
        });
      }
    });
  });
});


// Show image
router.get('/userimg/:id', (req, res) => {
  let id = req.params.id;
  db.collection('users').findOne({_id: ObjectId(id) }, (err, result) => {
      if (err) return console.log(err);
      res.contentType('image/jpeg');
      res.send(result.image.data.buffer);
      // console.log(result);
  });
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