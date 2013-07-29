var ASSERT = require("assert");

describe('css-include:', function() {

    var PATH = require('path');
    var FS = require('fs');
    var BORSCHIK = require('..');

    var testPath =  PATH.resolve(__dirname, 'css-include');

    afterEach(function(cb) {
        require('child_process').exec('rm ' + testPath + '/_*.css', function() {
            cb();
        });
    });

    const TESTS = [
        {
            "name": "css-tech joins @import",
            "input": PATH.resolve(__dirname, 'css-include/a.css'),
            "output": PATH.resolve(__dirname, 'css-include/_a.css'),
            "expect": PATH.resolve(__dirname, 'css-include/expect.css')
        },

        {
            "name": "css-tech removes duplicates @import",
            "input": PATH.resolve(__dirname, 'css-include/duplicate.css'),
            "output": PATH.resolve(__dirname, 'css-include/_duplicate.css'),
            "expect": PATH.resolve(__dirname, 'css-include/duplicate-expect.css')
        },

        {
            "name": "css-tech removes duplicates @import in included files",
            "input": PATH.resolve(__dirname, 'css-include/duplicate-inner.css'),
            "output": PATH.resolve(__dirname, 'css-include/_duplicate-inner.css'),
            "expect": PATH.resolve(__dirname, 'css-include/duplicate-inner-expect.css')
        }
    ];

    TESTS.forEach(function(test) {

        it(test.name, function(cb) {
            // proccess it
            BORSCHIK
                .api({
                    'comments': false,
                    'freeze': false,
                    'input': test.input,
                    'minimize': false,
                    'output': test.output,
                    'tech': 'css'
                })
                .then(function() {
                    try {
                        ASSERT.equal(
                            FS.readFileSync(test.output, 'utf-8').trim(),
                            FS.readFileSync(test.expect, 'utf-8').trim()
                        );
                        cb();
                    } catch(e) {
                        cb(e.toString());
                    }
                })
                .fail(function(e) {
                    cb(e.message);
                });
        });

    });

});
