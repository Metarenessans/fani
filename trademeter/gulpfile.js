var gulp = require('gulp');

// CSS
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var minifyCSS = require('gulp-csso');
var autoprefixer = require('gulp-autoprefixer');

var browserSync = require('browser-sync').create();
var notify = require('gulp-notify');

var path = "src/";

gulp.task('sass', function() {
  return gulp.src(path+'sass/main.sass')
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'expanded' }))
    .on('error', notify.onError())
    .pipe(autoprefixer({
      browsers: ['last 4 versions']
    }))
    .pipe(minifyCSS())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/css'))
    .pipe(browserSync.stream({ match: '**/*.css' }));
});

gulp.task('default', gulp.parallel("sass", function(done) {
  browserSync.init({
    proxy: "localhost:8080", 
    notify: true
  });

  gulp.watch(path+'sass/**', gulp.parallel('sass'));
  done();
}));
