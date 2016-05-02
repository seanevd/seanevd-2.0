var gulp = require('gulp'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    concat = require('gulp-concat'),

    typeset = require('gulp-typeset'),

    rename = require('gulp-rename'),
    browserSync = require('browser-sync').create(),
    exec = require('child_process').exec,
    sourcemaps = require('gulp-sourcemaps'),
    gutil = require('gulp-util'),
    awspublish = require('gulp-awspublish');


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

gulp.task('html', function () {
    return gulp.src('_site/**/*.html')
        .pipe(typeset())
        .pipe(gulp.dest('_site/dist'));
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

gulp.task('publish', function() {

  // create a new publisher using S3 options
  // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#constructor-property
  var publisher = awspublish.create({
    region: 'us-west-2',
    params: {
      Bucket: 'seanduncan.net'
    }
  });

  // define custom headers
  var headers = {
    'Cache-Control': 'max-age=315360000, no-transform, public'
    // ...
  };

  return gulp.src(['_site/**/*'])
     // gzip, Set Content-Encoding headers and add .gz extension
    // .pipe(awspublish.gzip({ ext: '.gz' }))

    // publisher will add Content-Length, Content-Type and headers specified above
    // If not specified it will set x-amz-acl to public-read by default
    .pipe(publisher.publish(headers))

    // create a cache file to speed up consecutive uploads
    .pipe(publisher.cache())

    .pipe(publisher.sync())

     // print upload updates to console
    .pipe(awspublish.reporter());
});


gulp.task('default', ['js-async', 'serve', 'jekyll']);
