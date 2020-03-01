var config = require("./gulp/config.js");
var gulp = require("gulp");
var load = require("require-dir");
var development, production;

//tasks配下のファイルを全て読み込み
load("./gulp/tasks", {recurse: true});

development = gulp.series( 
  "copy-third_party" ,
  "copy-images",
  "copy-javascripts",
  "compile-sass"
);

production = gulp.series( 
  "copy-third_party" ,
  "copy-images",
  "copy-javascripts",
  "compile-sass"
);

gulp.task("default", config.env.IS_DEVELOPMENT ? development : production);