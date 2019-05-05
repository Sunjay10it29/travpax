var express = require("express");
var router = express.Router();
var http = require("http");
const pg = require("pg");
const path = require("path");
var morgan = require("morgan");
var bodyParser = require("body-parser");
var session = require("express-session");
var cookieParser = require("cookie-parser");
var router = express.Router();
var User = require("../models/user");
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({
  extended: false
});

const connectionString = "postgres://sunny:12345@localhost:5432/travel";
// set morgan to log info about our requests for development use.
router.use(morgan("dev"));

// initialize body-parser to parse incoming parameters requests to req.body
router.use(
  bodyParser.urlencoded({
    extended: true
  })
);

// initialize cookie-parser to allow us access the cookies stored in the browser.
router.use(cookieParser());

/*
Helper Functions
*/
// initialize express-session to allow us track the logged-in user across sessions.
router.use(
  session({
    key: "user_sid",
    secret: "somerandonstuffs",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 600000
    }
  })
);


// This usually happens when you stop your express server after login, your cookie still remains saved in the browser.
router.use((req, res, next) => {
  if (req.cookies.user_sid && !req.session.user) {
    res.clearCookie("user_sid");
  }
  next();
});

// middleware function to check for logged-in users
var sessionChecker = (req, res, next) => {
  if (req.session.user && req.cookies.user_sid) {
    res.redirect("/index");
  } else {
    next();
  }
};

// route for Home-Page
router.get("/", sessionChecker, (req, res) => {
  res.redirect("/login");
});

// route for user signup
router.route("/signup").get(sessionChecker, (req, res) => {
      res.sendFile(
        path.join(__dirname, "..", "..", "client", "views", "signup.html")
      );
  })
  .post((req, res) => {
    User.create({
      agentcode: req.body.agentcode,
      username: req.body.username,
      email: req.body.email,
      password: req.body.password
    })
      .then(user => {
        req.session.user = user.dataValues;
        res.redirect("/index");
      })
      .catch(error => {
        res.redirect("/signup");
      });
  });

// route for user Login
router.route("/login")
  .get(sessionChecker, (req, res) => {
    res.sendFile(
      path.join(__dirname, "..", "..", "client", "views", "login.html")
    );
  })
  .post((req, res) => {

    var agentcode =  req.body.agentcode,
      username = req.body.username,
      password = req.body.password;

    User.findOne({
      where: {
        agentcode: agentcode,
        username: username
      }
    }).then(function(user) {
      if (!user) {
        res.redirect("/login");
      } else if (!user.validPassword(password)) {
        res.redirect("/login");
      } else {
        req.session.user = user.dataValues;
        res.redirect("/index");
      }
    });
  });

// route for user logout
router.get("/logout", (req, res) => {
  if (req.session.user && req.cookies.user_sid) {
    res.clearCookie("user_sid");
    res.redirect("/");
  } else {
    res.redirect("/login");
  }
});
router.get("/index", function(req, res, next) {
  if (req.session.user && req.cookies.user_sid) {
    res.sendFile(path.join(
      __dirname, '..', '..', 'client', 'views', 'index.html'));
  } else {
    res.redirect("/login");
  }
});


module.exports = router;
