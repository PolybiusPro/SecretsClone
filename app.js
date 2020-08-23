//jshint esversion:6
//.env
require('dotenv').config();

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

//Express Session
const session = require("express-session");

//Passport
const passport = require("passport");

//passport-local-Mongoose
const passportLocalMongoose = require("passport-local-mongoose");

//mongoose encryption
const encrypt = require("mongoose-encryption");

app.use(session({
  secret: "OurLittleSecret.",
  resave: false,
  saveUninitialized: false
}));

//Init passport and use passport for dealing with sessions
app.use(passport.initialize());
app.use(passport.session());

//Mongoose database connection
mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.set("useCreateIndex", true);

const userSchema = new Schema ({
  email: String,
  password: String
});

//Auto encrypts when save is called and decrypts when find is called

//Use passport local mongoose as plugin
userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

//Create local log-in strategy
passport.use(User.createStrategy());

//Set passport to serialize and deserialize user
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Root Route
app.get("/", function (req,res){
  res.render("home");
});

//Root Route
app.get("/login", function (req,res){
  res.render("login");
});

//Secrets route
app.get("/secrets", function(req,res){
  if(req.isAuthenticated()){
    res.render("secrets");
  }else {
    res.redirect("login");
  }
});

//Root Route
app.get("/register", function (req,res){
  res.render("register");
});

app.post("/register", function(req,res){
  User.register({username: req.body.username}, req.body.password, function(err , newUser){
    if(err){
      console.log(err);
    }else {
      passport.authenticate("local")(req,res, function(){
        res.redirect("/secrets");
      });
    }
  });

});

app.post("/login", function(req,res){

});

//app listening on port and 3000
app.listen(port || 3000, function() {
  console.log('Server started on port ' + port + " or " + localHost);
});
