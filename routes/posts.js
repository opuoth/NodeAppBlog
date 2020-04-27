var { CONNECTION_URL, OPTIONS, DATABSE } = require("../config/mongodb.config");
var router = require("express").Router();
var MongoClient = require("mongodb").MongoClient;
// var tokens = new require("csrf")();

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

router.get("/edit/:path", (req, res) => {
  var url = '/' + req.params.path;
  MongoClient.connect(CONNECTION_URL, OPTIONS, (error, client) => {
    var db = client.db(DATABSE);
    db.collection("posts").findOne({
      url: url
    }).then((original) => {
      res.render("./posts/edit.ejs", {original});
    }).catch((error) => {
      throw error;
    }).then(()=>{
      client.close();
    });
  });
});

router.post("/regist/input/:path", (req, res) => {
  var original = createRegistData(req.body);
  res.render("./posts/edit.ejs", { original });
});

// 確認ボタン
router.post("/regist/confirm/:path", (req, res) => {
  var original = createRegistData(req.body);
  var errors = validateRegistData(req.body);
  if(errors){
    res.render("./posts/edit.ejs", { errors, original });
    return;
  }
  res.render("./posts/confirm.ejs", { original });
});

router.post("/regist/execute/:path", (req, res) => {
  // var secret = req.session._csrf;
  // var token = req.cookies._csrf;
  
  // if(tokens.verify(secret, token) === false) {
  //   throw new Error("Invalid Token.");
  // }
  
  var original = createRegistData(req.body);
  var errors = validateRegistData(req.body);
  if (errors) {
    res.render("./posts/edit.ejs", { errors, original });
    return;
  }

  MongoClient.connect(CONNECTION_URL, OPTIONS, (error, client) => {
    var db = client.db(DATABSE);
    var url = '/' + req.params.path;
    var where = {url: url};
    var set = {$set: original};
    // console.log(where);
    // console.log(set);
    db.collection("posts")
      .updateOne(where, set)
      .then(() => {
        // delete req.session._csrf;
        // res.clearCookie("_csrf");
        res.redirect("/posts/regist/complete");
      }).catch((error) => {
        throw error;
      }).then(() => {
        client.close();
      });
  });
});

router.get("/regist/complete", (req, res) => {
  res.render("./account/posts/regist-complete.ejs");
});

router.get("/*", (req, res) => {
  MongoClient.connect(CONNECTION_URL, OPTIONS, (error, client) => {
    var db = client.db(DATABSE);
    db.collection("posts").findOne({
      url: req.url
    }).then((post) => {
      db.collection("users").findOne({
        name: post.authors[0]
      }).then((postUser)=>{
        res.render("./posts/index.ejs", {post, postUser});
      }).catch((error) => {
        throw error;
      });
    }).catch((error) => {
      throw error;
    }).then(() => {
      client.close();
    });
  });
});

module.exports = router;