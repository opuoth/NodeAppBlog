var config = require("../config");
var gulp = require("gulp");
var del = require("del");
var uglify = require("gulp-uglify");

gulp.task("minify-javascripts.clean",()=>{
  return del("./javascripts/**/*.scss", { cwd: config.path.output });
});

gulp.task("minify-javascripts", gulp.series("minify-javascripts.clean", (done)=>{
  gulp.src("./javascripts/**/*", {cwd: config.path.input})
    .pipe(uglify(config.uglify))
    .pipe(gulp.dest("./javascripts", {cwd: config.path.output}))
  done();
}));