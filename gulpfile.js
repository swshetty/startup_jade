var gulp = require('gulp'),
    fs = require('fs'),
    gutil = require('gulp-util'),
    rsync = require('rsyncwrapper').rsync,
    concat = require('gulp-concat'),
    connect = require('gulp-connect'),
    jadeInheritance = require('gulp-jade-inheritance'),
    sass = require('gulp-sass'),
    cached = require('gulp-cached'),
    _if = require('gulp-if'),
    clean = require('gulp-clean'),
    jade = require('gulp-jade'),
    changed = require('gulp-changed'),
    jshint = require('gulp-jshint'),
    notify = require('gulp-notify'),
    neat = require('node-neat').includePaths,
    plumber = require('gulp-plumber'),
    svg2png = require('gulp-svg2png'),
    filter = require('gulp-filter'),
    isWindows = /^win/.test(require('os').platform()),
    browserSync = require('browser-sync'),
    reload = browserSync.reload,
    sourcemaps = require('gulp-sourcemaps'),
    paths = {
        jade: { src: ['src/jade/**/*.jade'], dst: './public/'},
        sass: { src:'src/sass/**/*.scss', dst: './public/css/'},
        mainJS: { src: ['src/js/modules/*', 'src/js/services/**/**','src/js/filters/*.js', 'src/js/controllers/**/*.js', 'src/js/directives/**/*.js', 'src/js/main.js', 'src/js/ie/**/*.js'] },
        allJS: { src: ['src/js/vendor/*', 'src/js/plugins.js'], dst: './public/js/' },
        images: { src: ['src/img/**/*'], svg: ['src/img/**/*.svg'], dst: './public/'},
        fonts: { src: ['src/fonts/*'], dst: './public/'},
        json: { src: ['src/js/services/datas/**/*'], dst: './public/datas/'}
    };


gulp.task('sass', function() {
  return gulp.src(paths.sass.src)
    .pipe(plumber())
    .pipe(changed(paths.sass.dst))
    .pipe(sourcemaps.init())
    .pipe(sass({
        includePaths: ['styles'].concat(neat),
        errLogToConsole: true
    }))
    .pipe(sourcemaps.write('.', {includeContent: false}))
    .pipe(gulp.dest(paths.sass.dst))
    .pipe(_if(!isWindows, notify('Sass compiled')));
});

gulp.task('jade', function() {
  return gulp.src(paths.jade.src)
    .pipe(plumber())
    .pipe(cached('jade'))
    .pipe(jadeInheritance({basedir: 'src/jade/'}))
    .pipe(filter(function (file) {
      if(/[\/\\]partials[\/\\]/.test(file.path) || /[\/\\]mixins[\/\\]/.test(file.path)) {
        return false;
      }
      return !/\/_/.test(file.path) || !/^_/.test(file.relative);
    }))
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest(paths.jade.dst))
    .pipe(_if(!isWindows, notify({ 'message': 'Jade compiled', 'onLast': true })));
});

gulp.task('images', function(){
  gulp.src(paths.images.src, { base: './src/' })
    .pipe(gulp.dest(paths.images.dst));
  gulp.src('src/img/**/*.svg')
    .pipe(svg2png())
    .pipe(gulp.dest('./public/img/png/'));
});

gulp.task('fonts', function(){
  gulp.src(paths.fonts.src, { base: './src/' })
    .pipe(gulp.dest(paths.fonts.dst));
});

gulp.task('json', function(){
  gulp.src(paths.json.src)
    .pipe(gulp.dest(paths.json.dst));
});

gulp.task('js', function() {
  gulp.src([
      'src/js/vendor/angular-1.3.5.min.js',
      'src/js/vendor/ui-utils.min.js',
      'src/js/modules/*',
      'src/js/directives/**/*.js',
      'src/js/services/*.js',
      'src/js/filters/*.js',
      'src/js/controllers/**/*.js',
      'src/js/main.js',
      'src/js/decorators/**/*.js'])
    .pipe(plumber())
    .pipe(concat('main.js'))
    .pipe(gulp.dest(paths.allJS.dst))

  // IE specific JS
  gulp.src(['src/js/ie/**/*.js'])
    .pipe(plumber())
    .pipe(concat('ie.js'))
    .pipe(gulp.dest(paths.allJS.dst))
    .pipe(_if(!isWindows, notify('JavaScript compiled')));
});


gulp.task('connect', function() {
  browserSync({
    open: true,
    server: {
        baseDir: "./public"
    },
    port: 8080,
    /* Hide the notification. It gets annoying */
    notify: false,
    files: ["public/**/*.html", "public/js/main.js", "public/css/main.css"]
  });

});

gulp.task('clean', function () {
  return gulp.src('./public/', {read: false})
    .pipe(clean());
});

gulp.task('watch', ['connect'], function() {
  gulp.watch(paths.sass.src, ['sass']);
  gulp.watch(paths.jade.src, ['jade']);
  gulp.watch(paths.mainJS.src, ['js']);
  gulp.watch(paths.json.src, ['json']);
});

gulp.task('default', ['sass', 'jade', 'js', 'json', 'images', 'fonts']);
