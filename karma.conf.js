/* eslint-env es6:false */
/* eslint-disable no-var */

'use strict';

var path = require('path');
// var conf = require('./gulp/conf');

// var _ = require('lodash');
// var wiredep = require('wiredep');

// function listFiles() {
//     var wiredepOptions = _.extend({}, conf.wiredep, {
//         dependencies: true,
//         devDependencies: true,
//     });

//     return wiredep(wiredepOptions).js
//         .concat([
//             path.join(conf.paths.tmp, '/serve/app/index.module.js'),
//             path.join(conf.paths.src, '/**/*.spec.js'),
//             path.join(conf.paths.src, '/**/*.mock.js'),
//             path.join(conf.paths.src, '/**/*.html'),
//         ]);
// }

module.exports = function (config) {
    var configuration = {
        files: [], //listFiles(),

        singleRun: true,

        autoWatch: false,

        ngHtml2JsPreprocessor: {
            stripPrefix: conf.paths.src + '/',
            moduleName: 'avl-smm',
        },

        logLevel: 'WARN',
        frameworks: ['jasmine'],
        reporters: ['progress'],
        browsers: ['PhantomJS'],

        plugins: [
            'karma-phantomjs-launcher',
            'karma-jasmine',
            'karma-ng-html2js-preprocessor',
        ],
    };

    if (configuration.browsers[0] === 'Chrome' && process.env.TRAVIS) {
        configuration.customLaunchers = {
            'chrome-travis-ci': {
                base: 'Chrome',
                flags: ['--no-sandbox'],
            },
        };
        configuration.browsers = ['chrome-travis-ci'];
    }

    config.set(configuration);
};

/* eslint-enable no-var */
