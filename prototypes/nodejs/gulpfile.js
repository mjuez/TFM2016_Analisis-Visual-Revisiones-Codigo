const gulp = require('gulp');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');

gulp.task('compile', () => {
    const tsResult = tsProject.src().pipe(tsProject());
    return tsResult.js.pipe(gulp.dest('release'));
});

// Watch file changes and runs a task when this occurs.
gulp.task('watch', ['compile'], () => {
    gulp.watch('src/**/*.ts', ['compile']);
});

gulp.task('default', ['watch']);