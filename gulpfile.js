var gulp = require('gulp'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    concat = require('gulp-concat'),

    rename = require('gulp-rename'),
    browserSync = require('browser-sync').create(),
    exec = require('child_process').exec,
    sourcemaps = require('gulp-sourcemaps'),
    gutil = require('gulp-util');


gulp.task('jekyll', function (cb){
    exec('jekyll build', function(err, stdout, stderr) {
        console.log(stdout);
        cb(err);
    });
});

gulp.task('serve', function() {
    browserSync.init({
        port: 4060,
        server: {
            baseDir: "./_site/",
        },
        ui: {
            port: 4000
        }

    });
    gulp.watch("_assets/_sass/**/*.scss", ['styles']);
    gulp.watch("_assets/_js/**/*.js", ['js']);
    gulp.watch(["**/*.html", "**/*.md", "assets/**/*", "!_site/**/*"], ['jekyll']);
    gulp.watch("_site/*").on('change', browserSync.reload);
});

gulp.task('styles', function() {
    return sass('_assets/_sass/*.scss', { style: 'expanded' })
        .pipe(autoprefixer())
        .pipe(gulp.dest('assets/css'))
        .pipe(browserSync.stream());
});


gulp.task('images', function() {
  return gulp.src('_assets/_images/**/*')
    .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
    .pipe(gulp.dest('assets/images/'));
});

gulp.task('js-async', function() {
    return gulp.src(['node_modules/picturefill/dist/picturefill.min.js'])
        .pipe(concat('async.js'))
        .pipe(gulp.dest('assets/js'))
});

gulp.task('js', function() {
    return gulp.src(['_assets/_js/**/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(sourcemaps.init())
            .pipe(concat('main.js'))
            //look for supported gulp-sourcemap plugins
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('assets/js'))
});


gulp.task('default', ['js-async', 'serve', 'jekyll']);
