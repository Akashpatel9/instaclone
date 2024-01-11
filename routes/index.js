var express = require('express');
var router = express.Router();

const userModel = require('./users');
const localStrategy = require("passport-local");
const passport = require('passport');

passport.use(new localStrategy(userModel.authenticate()));


//home
router.get('/', function(req, res) {
  res.render('index', {footer: false});
});


//register user
router.post('/register', (req, res) => {
  var userdata = new userModel({
    username: req.body.username,
    name:req.body.name,
    email:req.body.emial
  });

  userModel.register(userdata, req.body.password)
    .then(function (registereduser) {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/profile");
      })
    })
});


//loginPage
router.get('/login', function(req, res) {
  res.render('loginPage', {footer: false});
});


//login Authentication
router.post("/login",passport.authenticate("local",{
  successRedirect:"/profile",
  failureRedirect:"/login"
}), (req,res)=>{
});


//logout
router.get('/logout', (req,res, next)=>{
  req.logout((err)=>{
    if(err){
      return next(err);
    }
    res.redirect('/');
  })
})


//feed
router.get('/feed', function(req, res) {
  res.render('feed', {footer: true});
});


//profile
router.get('/profile', isLoggedIn, async function(req, res) {
  const userData = await userModel.findOne({_id:req.user.id});
  res.render('profile', {footer: true, userData:userData});
});


//search
router.get('/search', function(req, res) {
  res.render('search', {footer: true});
});


//edit
router.get('/edit', function(req, res) {
  res.render('edit', {footer: true});
});


//upload
router.get('/upload', function(req, res) {
  res.render('upload', {footer: true});
});



function isLoggedIn( req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/');
}

module.exports = router;
