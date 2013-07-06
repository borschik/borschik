var ASSERT = require("assert");

describe('css-include:', function() {

    var PATH = require('path');
    var FS = require('fs');
    var BORSCHIK = require('..');

    const inputPath = PATH.resolve(__dirname, 'css-include/a.css');
    const outputPath = PATH.resolve(__dirname, 'css-include/_a.css');
    const expectPath = PATH.resolve(__dirname, 'css-include/expect.css');

    afterEach(function(cb) {
        require('child_process').exec('rm -rf ' + outputPath, function() {
            cb();
        });
    });

    it('css-tech joins @import', function(cb) {

        // proccess it
        BORSCHIK
            .api({
                'comments': false,
                'freeze': false,
                'input': inputPath,
                'minimize': false,
                'output': outputPath,
                'tech': 'css'
            })
            .then(function() {
                try {
                    ASSERT.equal(
                        FS.readFileSync(outputPath, 'utf-8'),
                        FS.readFileSync(expectPath, 'utf-8')
                    );
                    cb();
                } catch(e) {
                    cb(e.toString());
                }
            })
            .fail(function(e) {
                cb(e.message);
            });
    })

});
