var config = require("../config");
var gulp = require("gulp");
var del = require("del");

gulp.task("copy-images.clean",()=>{
  return del("./images/**/*", { cwd: config.path.output });
});

gulp.task("copy-images",gulp.series("copy-images.clean",(done)=>{
  gulp.src("./images/**/*",{ cwd: config.path.input })
    .pipe(gulp.dest("./images",{ cwd: config.path.output }));
  done();
}));