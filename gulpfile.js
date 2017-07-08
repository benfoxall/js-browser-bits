var gulp = require('gulp')
var rollup = require('rollup-stream')
var source = require('vinyl-source-stream')

// this is like my 4th take on this
gulp.task('postinstall', () =>
  gulp.src([
      'node_modules/reveal.js/**/*',
      'node_modules/slide-builder/slide-builder.js',
      'node_modules/@tweenjs/tween.js/src/Tween.js',
    ],{ "base" : "node_modules" })
  .pipe(gulp.dest('docs/lib'))
)
