var gulp = require('gulp');
var url = require('url');
var proxy = require('proxy-middleware');
var browserSync = require('browser-sync');

// this task utilizes the browsersync plugin
// to create a dev server instance
// at http://localhost:9000
gulp.task('serve', ['build'], function (done) {
    var proxyFunc = proxy(url.parse('http://localhost:5000'));


    browserSync({
        open: false,
        port: 9000,
        server: {
            baseDir: ['.'],
            middleware: function (req, res, next) {
                res.setHeader('Access-Control-Allow-Origin', '*');
                if (req.url.match(/^\/api/)) {
                    proxyFunc(req, res, next);
                } else {
                    next();
                }
            }
        }
    }, done);
});
