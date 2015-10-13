/* eslint-env es6:false */
/* eslint-disable no-var */

// all gulp tasks are located in the ./build/tasks directory
// gulp configuration is in files in ./build directory

var gulp = require('gulp');

require('require-dir')('build/tasks');

gulp.task('default', ['clean'], function () {
    gulp.start('watch');
});

module.exports = gulp;

/* eslint-enable no-var */
