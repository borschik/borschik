describe('Useful info in case of failed minimize:', function() {

    var ASSERT = require('assert');
    var BORSCHIK = require('..');
    var FS = require('fs');
    var PATH = require('path');


    const testJS = PATH.resolve(__dirname, 'minimize-failed/fail.js');
    const testJSOut = PATH.resolve(__dirname, testJS + '.out');
    const testJSErrorFile = PATH.resolve(__dirname, testJSOut + '.borschik-error');

    const testCSS = PATH.resolve(__dirname, 'minimize-failed/fail.css');
    const testCSSOut = PATH.resolve(__dirname, testCSS + '.out');
    const testCSSErrorFile = PATH.resolve(__dirname, testCSSOut + '.borschik-error');

    afterEach(function() {
        try {
            FS.unlinkSync(testJSErrorFile);
        } catch(e) {}

        try {
            FS.unlinkSync(testCSSErrorFile);
        } catch(e) {}
    });

    it('should write file error result to "filename.borschik-error" (js)', function(cb) {

        BORSCHIK
            .api({
                'freeze': true,
                'input': testJS,
                'minimize': true,
                'output': testJSOut
            })
            .then(function() {
                cb('Successfully builded');
            })
            .fail(function(e) {
                try {
                    ASSERT.equal(FS.existsSync(testJSErrorFile), true);
                    cb();
                } catch(e) {
                    cb(e);
                }
            });

    });

    it('should write file error result to "filename.borschik-error" (css)', function(cb) {

        BORSCHIK
            .api({
                'freeze': true,
                'input': testCSS,
                'minimize': true,
                'output': testCSSOut
            })
            .then(function() {
                cb('Successfully builded');
            })
            .fail(function(e) {
                try {
                    ASSERT.equal(FS.existsSync(testCSSErrorFile), true);
                    cb();
                } catch(e) {
                    cb(e);
                }
            });

    });

});
