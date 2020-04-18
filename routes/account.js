var router = require("express").Router();

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

router.get("/", (req, res) => {
  res.render("./account/index.ejs");
});

router.get("/posts/regist", (req, res) => {
  res.render("./account/posts/regist-form.ejs")
});

// 戻るボタン
router.post("/posts/regist/input", (req, res) => {
  var original = createRegistData(req.body);
  res.render("./account/posts/regist-form.ejs", { original });
});

// 確認ボタン
router.post("/posts/regist/confirm", (req, res) => {
  var original = createRegistData(req.body);
  var errors = validateRegistData(req.body);
  if(errors){
    res.render("./account/posts/regist-form.ejs", { errors, original });
    return;
  }
  res.render("./account/posts/regist-confirm.ejs", { original });
});

module.exports = router;