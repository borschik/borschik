var ASSERT = require("assert");

describe('css-link:', function() {

    var PATH = require('path');
    var FS = require('fs');
    var BORSCHIK = require('..');

    const basePath = PATH.resolve(__dirname, 'css-link');
    const configPath = PATH.resolve(basePath, '.borschik');

    afterEach(function(cb) {
        try {
            FS.unlinkSync(configPath);
        } catch(e) {}

        require('child_process').exec('rm -rf ' + basePath + '/*-out.*', function() {
            cb();
        });
    });

    const TESTS = [
        {name: 'should ignore src in "filter:expression"', file: '1.css'}
    ];

    generateTests();

    function generateTests() {
        TESTS.forEach(function(test) {

            var input = PATH.resolve(basePath, test.file);
            var ext = PATH.extname(input);
            var output = PATH.resolve(basePath, test.file.replace(ext, '-out' + ext));
            var expect = PATH.resolve(basePath, test.file.replace(ext, '-expect' + ext));

            it(test.name, function(cb) {

                // proccess it
                BORSCHIK
                    .api({
                        'comments': false,
                        'freeze': true,
                        'input': input,
                        'minimize': false,
                        'output': output,
                        'tech': ext.replace('.', '')
                    })
                    .then(function() {
                        try {
                            ASSERT.equal(
                                FS.readFileSync(output, 'utf-8'),
                                FS.readFileSync(expect, 'utf-8')
                            );
                            cb();
                        } catch(e) {
                            cb(e);
                        }
                    })
                    .fail(function(e) {
                        cb(e);
                    });
            });

        });
    }

});
