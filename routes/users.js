var { CONNECTION_URL, OPTIONS, DATABSE } = require("../config/mongodb.config");
var { MAX_ITEM_PER_PAGE } = require("../config/app.config").search;
var { authenticate, authorize } = require("../lib/security/accountcontrol.js");
var { MAX_ITEM_PER_PAGE } = require("../config/app.config").search;
var router = require("express").Router();
var MongoClient = require("mongodb").MongoClient;

router.get("/index", (req, res) => {
  var page = req.query.page ? parseInt(req.query.page) : 1;
  var keyword = req.query.keyword || "";

  var regexp = new RegExp(`.*${keyword}.*`);
  var query = {
    name: regexp
  };
  MongoClient.connect(CONNECTION_URL, OPTIONS, (error, client) => {
    var db = client.db(DATABSE);
    Promise.all([
      db.collection("users")
        .find(query)
        .count(),
      db.collection("users")
        .find(query)
        .sort({ name: 1 })
        .skip( (page - 1) * MAX_ITEM_PER_PAGE)
        .limit(MAX_ITEM_PER_PAGE)
        .toArray()
    ]).then((results) => {
      var data = {
        keyword,
        count: results[0],
        users: results[1],
        pagination: {
          max: Math.ceil(results[0] / MAX_ITEM_PER_PAGE),
          current: page
        }
      };
      res.render("./users/list.ejs", data);
    }).catch((error) => {
      console.log(query);
      throw error;
    }).then(() => {
      client.close();
    });
  });
});

router.get("/:email", async (req, res) => {
  var client = await MongoClient.connect(CONNECTION_URL, OPTIONS);
  var db = client.db(DATABSE);
  var currentUser = await db.collection("users").findOne({email: req.params.email});
  var page = req.query.page ? parseInt(req.query.page) : 1;
  var query = {authors: currentUser.name};
  Promise.all([
    await db.collection("posts").find(query).count(),
    db.collection("posts").find(query).sort({ published: -1 })
      .skip( (page - 1) * MAX_ITEM_PER_PAGE)
      .limit(MAX_ITEM_PER_PAGE)
      .toArray()
  ]).then((results)=>{
    var data = {
      currentUser: currentUser,
      list: results[1],
      pagination: {
        max: Math.ceil( results[0]/ MAX_ITEM_PER_PAGE),
        current: page
      },
      count: results[0]
    };
    res.render("./users/show.ejs", data);
  }).catch((error)=>{
    throw error;
  }).then(()=>{
    client.close();
  })
});

module.exports = router;