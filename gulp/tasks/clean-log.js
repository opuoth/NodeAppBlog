var config = require("../config");
var gulp = require("gulp");
var del = require("del");

gulp.task("clean-log",()=>{
  return del("./**/*", { cwd: config.path.log });
});