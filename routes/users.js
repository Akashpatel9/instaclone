const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/instaData");

const plm = require("passport-local-mongoose")

const userSchema = mongoose.Schema({
  username:String,
  name:String,
  password:String,
  dob:String,
  email:String,
  bio:String,
  image:{
    type:String,
    default:"https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
  },
  posts:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:"post"
    }
  ],
  followers:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"user"
  }],
  following:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"user"
  }]
});

userSchema.plugin(plm);
module.exports = mongoose.model("user",userSchema);