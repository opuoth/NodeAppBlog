var { CONNECTION_URL, OPTIONS, DATABSE } = require("../config/mongodb.config");
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

router.get("/:email", (req, res) => {
  var email = req.params.email;
  MongoClient.connect( CONNECTION_URL, OPTIONS, (error, client) => {
    var db = client.db(DATABSE);
  
    db.collection("users")
      .findOne({email: email}
    )
    .then((user)=>{
      db.collection("posts")
        .find({authors: user.name})
        .sort({ published: -1 })
        .toArray((error, posts) =>{
          var data = {user: user, list: posts};
          res.render("./users/show.ejs", data);
        })
    }).catch((error)=>{
      throw error;
    }).then(()=>{
      client.close();
    });
  });
});

module.exports = router;