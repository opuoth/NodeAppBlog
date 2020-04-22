var router = require("express").Router();

router.get("/", (req, res) => {
  throw new Error("abc");
  res.render("./index.ejs");
});

module.exports = router;