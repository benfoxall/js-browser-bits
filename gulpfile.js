var gulp = require('gulp')

// this is like my 4th take on this
gulp.task('postinstall', () =>
  gulp.src([
      'node_modules/reveal.js/**/*',
      'node_modules/slide-builder/slide-builder.js'
    ],{ "base" : "node_modules" })
  .pipe(gulp.dest('docs/lib'))
)
