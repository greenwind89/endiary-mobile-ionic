var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');

var paths = {
  sass: ['./ui/scss/**/*.scss'],
  js: ['./js/**/*.js']
};

gulp.task('default', ['sass', 'concatAppsJs']);
gulp.task('build', ['sass', 'concatAppsJs']);

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass({
      errLogToConsole: true
    }))
    .pipe(gulp.dest('./www/dist/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/dist/'))
    .on('end', done);
});

gulp.task('watch', function() {
  // gulp.watch(paths.sass, ['sass']);
  // gulp.watch(paths.js, ['concatAppsJs']);
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});


gulp.task('concatAppsJs', function() {
  return gulp.src(['./www/js/main.js', './www/js/**/main.js', './www/js/**/*.js'])
    .pipe(concat('endiary.js'))
    .pipe(gulp.dest('./www/dist/'));
});
