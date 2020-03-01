var config = require("../config");
var gulp = require("gulp");
var del = require("del");
var sass = require("gulp-sass");

gulp.task("compile-sass.clean",()=>{
  return del("./stylesheets/**/*.scss", { cwd: config.path.output });
});

gulp.task("compile-sass", gulp.series("compile-sass.clean", (done)=>{
  gulp.src("./stylesheets/**/*.scss", {cwd: config.path.input})
    .pipe(sass(config.sass))
    .pipe(gulp.dest("./stylesheets", {cwd: config.path.output}))
  done();
}));