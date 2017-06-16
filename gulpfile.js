var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var minify = require('gulp-minify');

gulp.task('default', ['watch'], function () {
});

gulp.task('styles', function() {
  return gulp.src('assets/stylesheets/*.scss')
    .pipe(sass({outputStyle: 'compressed', sourceComments: 'map'}, {errLogToConsole: true}))
    .pipe(autoprefixer('last 4 version'))
    .pipe(gulp.dest('assets/stylesheets'));
});

gulp.task('scripts', function() {
  return gulp.src('assets/javascripts/*.js')
    .pipe(concat('main.js'))
    .pipe(minify())
    .pipe(gulp.dest('assets/javascripts/minified'));
});

gulp.task('watch', function() {
    gulp.watch('assets/stylesheets/*.scss', ['styles']);
    gulp.watch('assets/javascripts/*.js', ['scripts']);
});
