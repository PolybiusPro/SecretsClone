//jshint esversion:6
//.env
require('dotenv').config();

//bcrypt
const bcrypt = require("bcrypt");
const saltRounds = 10;

//express
const express = require('express');
const app = express();

//ports
const port = process.env.PORT;
const localHost = 3000;

//body-parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
  extended: true
}));

//ejs
const ejs = require('ejs');
app.set('view engine', 'ejs');

//Static Assets
app.use(express.static("public"));

//mongoose
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//mongoose encryption
const encrypt = require("mongoose-encryption");

//Mongoose database connection
mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const userSchema = new Schema ({
  email: String,
  password: String
});

//Auto encrypts when save is called and decrypts when find is called

userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});

const User = new mongoose.model("User", userSchema);

//Root Route
app.get("/", function (req,res){
  res.render("home");
});

//Root Route
app.get("/login", function (req,res){
  res.render("login");
});

//Root Route
app.get("/register", function (req,res){
  res.render("register");
});

app.post("/register", function(req,res){

  bcrypt.hash(req.body.password, saltRounds, function(err, hash){
    const newUser = new User({
      email: req.body.username,
      password: hash
    });

    newUser.save(function(err){
      if(err){
        console.log(err);
      }else {
        res.render("secrets");
      }
    });
  });
});

app.post("/login", function(req,res){
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({email: username}, function(err, foundUser){
    if(err){
      console.log(err);
    } else {
      if(foundUser){
        bcrypt.compare(password, foundUser.password, hash, function(err,compareResult){
          if(compareResult === true){
            res.render("secrets");
          }
        });
      }
    }
  });
});

//app listening on port and 3000
app.listen(port || 3000, function() {
  console.log('Server started on port ' + port + " or " + localHost);
});
