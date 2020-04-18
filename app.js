var { SESSION_SECRET } = require("./config/app.config").security;
var accesslogger = require("./lib/log/accesslogger");
var systemlogger = require("./lib/log/systemlogger");
var express = require("express");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var session = require("express-session");
var app = express();

app.set("view engine", "ejs");
app.disable("x-powered-by");

app.use("/public", express.static("./public/" + (process.env.NODE_ENV === "development" ? "development" : "production")));

app.use(accesslogger());

app.use(cookieParser());

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  name: "sid"
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/", require("./routes/index.js"));

app.use("/posts/", require("./routes/posts.js"));

app.use("/search/", require("./routes/search.js"));

app.use("/account/", require("./routes/account.js"));

app.use(systemlogger());

app.listen(3000);