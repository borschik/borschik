var ASSERT = require("assert");

describe('freeze-inline:', function() {

    var PATH = require('path');
    var FS = require('fs');
    var BORSCHIK = require('..');

    const basePath = PATH.resolve(__dirname, 'freeze-inline');
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
        {name: 'should inline gif image in css', file: 'gif.css'},
        {name: 'should inline gif image in js', file: 'gif.js'},
        {name: 'should inline png image in css', file: 'png.css'},
        {name: 'should inline png image in js', file: 'png.js'},
        {name: 'should inline svg image in css', file: 'svg.css'},
        {name: 'should inline svg filter in css', file: 'svg-filter.css'}
    ];

    describe('base64: ', function() {

        beforeEach(function() {
            var config = FS.readFileSync(PATH.resolve(basePath, 'borschik-base64.json'));
            FS.writeFileSync(configPath, config);
        });

        generateTests('base64');

    });

    describe('encodeURIComponent: ', function() {

        beforeEach(function() {
            var config = FS.readFileSync(PATH.resolve(basePath, 'borschik-encodeURIComponent.json'));
            FS.writeFileSync(configPath, config);
        });

        generateTests('encodeURIComponent');

    });

    describe('encodeURIComponentSvg: ', function() {

        beforeEach(function() {
            var config = FS.readFileSync(PATH.resolve(basePath, 'borschik-encodeURIComponentSvg.json'));
            FS.writeFileSync(configPath, config);
        });

        generateTests('encodeURIComponentSvg', [
            {name: 'should inline svg image in css', file: 'svg.css'},
            {name: 'should inline svg image in js', file: 'svg.js'}
        ]);

    });

    describe('encodeURI: ', function() {

        beforeEach(function() {
            var config = FS.readFileSync(PATH.resolve(basePath, 'borschik-encodeURI.json'));
            FS.writeFileSync(configPath, config);
        });

        generateTests('encodeURI');

    });

    function generateTests(testSuffix, tests) {
        (tests || TESTS).forEach(function(test) {

            var input = PATH.resolve(basePath, test.file);
            var ext = PATH.extname(input);
            var output = PATH.resolve(basePath, test.file.replace(ext, '-out' + ext));
            var expect = PATH.resolve(basePath, test.file.replace(ext, '-expect-' + testSuffix + ext));

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
                    .fail(cb);
            });

            it('process as string ' + test.name, function(cb) {

                // proccess it
                BORSCHIK
                    .api({
                        'comments': false,
                        'freeze': true,
                        'inputString': FS.readFileSync(input, 'utf-8'),
                        'basePath': basePath,
                        'minimize': false,
                        'tech': ext.replace('.', '')
                    })
                    .then(function(result) {
                        ASSERT.equal(
                            result,
                            FS.readFileSync(expect, 'utf-8')
                        );
                        cb();
                    }, cb)
                    .fail(cb);
            });

        });
    }

});
