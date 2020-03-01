var config = require("../config");
var gulp = require("gulp");
var del = require("del");

gulp.task("copy-third_party.clean", ()=>{
  return del("./third_party/**/*", { cwd: config.path.output });
});

//jquery, popper.js, bootstrap, font-awesome
gulp.task("copy-third_party.jquery", gulp.series("copy-third_party.clean",(done)=>{
  gulp.src("./jquery/dist/**/*", { cwd: config.path.node_modules })
    .pipe(gulp.dest("./third_party/jquery", { cwd: config.path.output }));
  done();
}));

gulp.task("copy-third_party.popper.js", gulp.series("copy-third_party.clean",(done)=>{
  gulp.src("./popper.js/dist/**/*", { cwd: config.path.node_modules })
    .pipe(gulp.dest("./third_party/popper.js", { cwd: config.path.output }));
  done();
}));

gulp.task("copy-third_party.bootstrap", gulp.series("copy-third_party.clean",(done)=>{
  gulp.src("./bootstrap/dist/**/*", { cwd: config.path.node_modules })
    .pipe(gulp.dest("./third_party/bootstrap", { cwd: config.path.output }));
  done();
}));

gulp.task("copy-third_party.font-awesome", gulp.series("copy-third_party.clean",(done)=>{
  gulp.src("./font-awesome/**/*", { cwd: config.path.node_modules })
    .pipe(gulp.dest("./third_party/font-awesome", { cwd: config.path.output }));
  done();
}));

gulp.task("copy-third_party", gulp.series(
    "copy-third_party.jquery",
    "copy-third_party.popper.js",
    "copy-third_party.bootstrap",
    "copy-third_party.font-awesome"
  ));