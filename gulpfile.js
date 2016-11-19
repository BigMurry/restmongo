const gulp = require('gulp')
const babel = require('gulp-babel')

gulp.task('build', function (cb) {
  return gulp.src('src/**/*.js')
             .pipe(babel({presets: ['es2015']}))
             .pipe(gulp.dest('dist'))
})

gulp.task('transformTest', function (cb) {
  return gulp.src('test/**/*.js')
             .pipe(babel({presets: ['es2015']}))
             .pipe(gulp.dest('__test__'))
})

gulp.task('default', ['build', 'transformTest'])
