var { CONNECTION_URL, OPTIONS, DATABSE } = require("../config/mongodb.config");
var { authenticate, authorize } = require("../lib/security/accountcontrol.js");
var router = require("express").Router();
var MongoClient = require("mongodb").MongoClient;
var tokens = new require("csrf")();

var createRegistData = function(body) {
  var datetime = new Date();
  return {
    url: body.url,
    published: datetime,
    title: body.title,
    content: body.content,
    keywords: (body.keywords || "").split(","),
    authors: (body.authors || "").split(","),
  };
};

var validateRegistData = function(body) {
  var isValidated = true, errors = {};

  if(!body.url) {
    isValidated = false;
    errors.url = "URLが未入力です。'/'から始まるURLを入力してください。";
  }

  if(body.url && /^\//.test(body.url) === false) {
    isValidated = false;
    errors.url = "'/'から始まるURLを入力してください。";
  }
  
  if(!body.title) {
    isValidated = false;
    errors.title = "タイトルが未入力です。任意のタイトルを入力してください。";
  }
  
  return isValidated ? undefined : errors;
};

router.get("/", authorize("readWrite"), (req, res) => {
  res.render("./account/index.ejs");
});

//ログイン画面
router.get("/login", (req, res) => {
  res.render("./account/login.ejs", { message: req.flash("message") });
});

//ログイン処理
router.post("/login", authenticate());

router.post("/logout", (req, res) => {
  req.logout();
  res.redirect("/account/login");
});

router.get("/posts/regist", authorize("readWrite"), (req, res) => {
  tokens.secret((error, secret) => {
    var token = tokens.create(secret);
    MongoClient.connect(CONNECTION_URL, OPTIONS, (error, client)=>{
      var db = client.db(DATABSE);
      db.collection("users")
        .findOne({email: req.session.passport.user})
      .then((currentUser)=>{
        req.session._csrf = secret;
        res.cookie("_csrf", token);
        res.render("./account/posts/regist-form.ejs",{original:  {authors: currentUser.name}});
      }).catch((error)=>{
        throw error;
      }).then(()=>{
        client.close();
      })
    });
  });
});

// 戻るボタン
router.post("/posts/regist/input", authorize("readWrite"), (req, res) => {
  var original = createRegistData(req.body);
  res.render("./account/posts/regist-form.ejs", { original });
});

// 確認ボタン
router.post("/posts/regist/confirm", authorize("readWrite"), (req, res) => {
  var original = createRegistData(req.body);
  var errors = validateRegistData(req.body);
  if(errors){
    res.render("./account/posts/regist-form.ejs", { errors, original });
    return;
  }
  res.render("./account/posts/regist-confirm.ejs", { original });
});

router.post("/posts/regist/execute", authorize("readWrite"), (req, res) => {
  var secret = req.session._csrf;
  var token = req.cookies._csrf;
  
  if(tokens.verify(secret, token) === false) {
    throw new Error("Invalid Token.");
  }
  
  var original = createRegistData(req.body);
  var errors = validateRegistData(req.body);
  if (errors) {
    res.render("./account/posts/regist-form.ejs", { errors, original });
    return;
  }

  MongoClient.connect(CONNECTION_URL, OPTIONS, (error, client) => {
    var db = client.db(DATABSE);
    db.collection("posts")
      .insertOne(original)
      .then(() => {
        delete req.session._csrf;
        res.clearCookie("_csrf");
        res.redirect("/account/posts/regist/complete");
      }).catch((error) => {
        throw error;
      }).then(() => {
        client.close();
      });
  });
});

//登録完了画面
router.get("/posts/regist/complete", authorize("readWrite"), (req, res) => {
  res.render("./public/message.ejs",{title: "新規記事登録", message: "登録完了"});
});

module.exports = router;