var express = require('express');
var router = express.Router();
const userModel = require('./users');
const postModel = require('./post');
const localStrategy = require("passport-local");
const passport = require('passport');
const upload = require('./multer');

passport.use(new localStrategy(userModel.authenticate()));



//home
router.get('/', function (req, res) {
  res.render('index', { footer: false });
});


//register user
router.post('/register', (req, res) => {
  var userdata = new userModel({
    username: req.body.username,
    name: req.body.name,
    email: req.body.email
  });

  userModel.register(userdata, req.body.password)
    .then(function (registereduser) {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/profile");
      })
    })
});


//loginPage
router.get('/login', function (req, res) {
  res.render('loginPage', { footer: false });
});


//login Authentication
router.post("/login", passport.authenticate("local", {
  successRedirect: "/profile",
  failureRedirect: "/login"
}), (req, res) => {
});


//logout
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  })
})


//feed
router.get('/feed', isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({username : req.session.passport.user});
  const posts = await postModel.find().populate("user");
  res.render('feed', { footer: true, posts ,user});
});


//likes
router.get('/postLike/:id', isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({username : req.session.passport.user});
  const post = await postModel.findOne({_id:req.params.id});
  if(post.likes.includes(user._id)){
    post.likes.splice(post.likes.indexOf(user._id),1);
  }else{
    post.likes.push(user._id);
  }

  await post.save();

  res.redirect('/feed');
});


//profile
router.get('/profile', isLoggedIn, async function (req, res) {
  const userData = await userModel.findOne({username:req.session.passport.user}).populate("posts");
  res.render('profile', { footer: true,userData});
});


//search
router.get('/search', isLoggedIn, function (req, res) {
  res.render('search', { footer: true });
});


//edit
router.get('/edit', isLoggedIn, async function (req, res) {
  const data = await userModel.findOne({ username: req.session.passport.user });
  res.render('edit', { footer: true, data });
});


//upload
router.get('/upload', isLoggedIn, function (req, res) {
  res.render('upload', { footer: true });
});


//post upload
router.post('/upload', isLoggedIn, upload.single('image'), async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });

  const post = await postModel.create({
    picture: req.file.filename,
    caption: req.body.caption,
    user: user._id
  })
  user.posts.push(post._id);
  await user.save();
  res.redirect('/feed');
});

//update
router.post('/update', upload.single('image'), async function (req, res) {
  const user = await userModel.findOneAndUpdate(
    { username: req.session.passport.user },
    { name: req.body.name, username: req.body.username, bio: req.body.bio },
    { new: true }
  );
  console.log(req.file);
  if(req.file!==undefined){
    user.image = req.file.filename;
  }

  await user.save();
  res.redirect('/profile');
});


//searchfield
router.get('/username/:username',isLoggedIn,async(req,res)=>{
  const regex = new RegExp(`^${req.params.username}`,'i');
  const users = await userModel.find({username:regex});
  res.json(users);
})



//isLoggedin fn
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

module.exports = router;
