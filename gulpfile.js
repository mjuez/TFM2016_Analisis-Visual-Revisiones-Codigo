const gulp = require('gulp');
const ts = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');
const tsProject = ts.createProject('tsconfig.json');

gulp.task('build-api', () => {
    const tsResult = tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(tsProject());
    return tsResult.js
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('release'));
});

gulp.task('build-client', () => {
    return gulp.src('src/client/**/*.*')
        .pipe(gulp.dest('release/client'));
});

gulp.task('compile', ['build-api', 'build-client']);

// Watch file changes and runs a task when this occurs.
gulp.task('watch', ['compile'], () => {
    gulp.watch('src/**/*.ts', ['compile']);
});

gulp.task('default', ['watch']);