var config = require("../config");
var gulp = require("gulp");
var del = require("del");

gulp.task("copy-javascripts.clean",()=>{
  return del("./javascripts/**/*", { cwd: config.path.output });
});

gulp.task("copy-javascripts",gulp.series("copy-javascripts.clean",(done)=>{
  gulp.src("./javascripts/**/*",{ cwd: config.path.input })
    .pipe(gulp.dest("./javascripts",{ cwd: config.path.output }));
  done();
}));