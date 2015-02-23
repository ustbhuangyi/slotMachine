// gulp 以及 "gulp-" 前缀的插件引入
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var browserSync = require('browser-sync');
var reload = browserSync.reload;

var dest = 'dist/';

var path = {
  js: {
    src: ['src/js/effect.js', 'src/js/format.js',
      'src/js/imageloader.js', 'src/js/timeline.js',
      'src/js/animation.js', 'src/js/slotmachine.js'],
    dest: dest + 'js/'
  },
  vender: {
    src: 'src/vender/**/*',
    dest: dest + 'vender/'
  },
  css: {
    src: 'src/css/**/*',
    dest: dest + 'css/'
  },
  image: {
    src: 'src/image/**/*',
    dest: dest + 'image/'
  },
  html: {
    src: 'src/**/*.html',
    dest: dest
  }
};

gulp.task('js', function () {
  return gulp.src(path.js.src)
    .pipe($.concat('slotmachine.js'))
    .pipe(gulp.dest(path.js.dest))
    .pipe(reload({stream: true}));
});

gulp.task('css', function () {
  return gulp.src(path.css.src)
    .pipe(gulp.dest(path.css.dest))
    .pipe(reload({stream: true}));
});

gulp.task('vender', function () {
  return gulp.src(path.vender.src)
    .pipe(gulp.dest(path.vender.dest));
});

gulp.task('image', function () {
  return gulp.src(path.image.src)
    .pipe(gulp.dest(path.image.dest));
});

gulp.task('html', function () {
  return gulp.src(path.html.src)
    .pipe(gulp.dest(path.html.dest))
    .pipe(reload({stream: true}));
});

gulp.task('watch', function () {
  gulp.watch(path.js.src, ['js']);
  gulp.watch(path.css.src, ['css']);
  gulp.watch(path.html.src, ['html']);
});

// browserSync
gulp.task('browserSync', function () {
  // browserSync 的 config options，
  // docs: http://www.browsersync.io/docs/options/
  var _config = {
    server: {
      baseDir: dest,
      notify: false
    }
  };

  browserSync(_config);

});

gulp.task('default', ['js', 'vender', 'css', 'image', 'html']);
gulp.task('serve', ['default', 'browserSync', 'watch']);
