var { CONNECTION_URL, OPTIONS, DATABASE } = require("../../config/mongodb.config");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var MongoClient = require("mongodb").MongoClient;
var initialize, authenticate, authorize;

passport.serializeUser((email, done) => {
  done(null, email);
});

passport.deserializeUser((email, done) => {
  MongoClient.connect(CONNECTION_URL, OPTIONS, (error, client) => {
    var db = client.db(DATABASE);
    db.collection("users")
    .findOne({ email })
    .then((user) => {
      done(null, user);
    }).catch((error) => {
      done(error);
    }).then(() => {
      client.close();
    });
  })
});

passport.use("local-strategy", 
  new LocalStrategy({
    usernameField: "username",
    passwordField: "password",
    passReqToCallback: true
  }, (req, username, password, done) => {
    MongoClient.connect(CONNECTION_URL, OPTIONS, (error, client) => {
      var db = client.db(DATABASE);
      db.collection("users").findOne({
        email: username,
        password: password
      }).then((user) => {
        if(user){
          req.session.regenerate((error) => {
            if(error) {
              done(error);
            } else {
              done(null, user.email);
            }
          });
        }else{
          done(null, false, req.flash("message", "ユーザー名またはパスワードが間違っています。"));
        }
      }).catch((error) => {
        done(error);
      }).then(() => {
        client.close();
      })
    });
  })
);

initialize = function () {
  return [
    passport.initialize(),
    passport.session()
  ];
}

authenticate = function () {
  return passport.authenticate(
    "local-strategy", {
      successRedirect: "/account/",
      failureRedirect: "/account/login"
    }
  )
}

module.exports = {
  initialize,
  authenticate,
  authorize
}