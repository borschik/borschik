var ASSERT = require("assert");

describe('freeze-css-inline:', function() {

    var PATH = require('path');
    var FS = require('fs');
    var BORSCHIK = require('..');

    const basePath = PATH.resolve(__dirname, 'freeze-css-inline');
    const configPath = PATH.resolve(__dirname, 'freeze-css-inline', '.borschik');

    afterEach(function(cb) {
        require('child_process').exec('rm -rf ' + basePath + '/*-out.*', function() {
            cb();
        });
    });

    const TESTS = [
        {name: 'should inline gif image', file: 'gif.css'},
        {name: 'should inline png image', file: 'png.css'},
        {name: 'should inline svg image', file: 'svg.css'}
    ];

    describe('base64: ', function() {

        beforeEach(function() {
            var config = FS.readFileSync(PATH.resolve(__dirname, 'freeze-css-inline', 'borschik-base64.json'));
            FS.writeFileSync(configPath, config);
        });

        afterEach(function() {
            try {
                FS.unlinkSync(configPath);
            } catch(e) {}
        });

        TESTS.forEach(function(test) {

            var input = PATH.resolve(basePath, test.file);
            var ext = PATH.extname(input);
            var output = PATH.resolve(basePath, test.file.replace(ext, '-out' + ext));
            var expect = PATH.resolve(basePath, test.file.replace(ext, '-expect-base64' + ext));

            it(test.name, function(cb) {

                // proccess it
                BORSCHIK
                    .api({
                        'comments': false,
                        'freeze': true,
                        'input': input,
                        'minimize': false,
                        'output': output,
                        'tech': 'css'
                    })
                    .then(function() {
                        try {
                            ASSERT.equal(
                                FS.readFileSync(output, 'utf-8'),
                                FS.readFileSync(expect, 'utf-8')
                            );
                            cb();
                        } catch(e) {
                            cb(e.toString());
                        }
                    })
                    .fail(function(e) {
                        cb(e.toString());
                    });
            });

        });
    });

    describe('encodeURIComponent: ', function() {

        beforeEach(function() {
            var config = FS.readFileSync(PATH.resolve(__dirname, 'freeze-css-inline', 'borschik-encodeURIComponent.json'));
            FS.writeFileSync(configPath, config);
        });

        afterEach(function() {
            try {
                FS.unlinkSync(configPath);
            } catch(e) {}
        });

        TESTS.forEach(function(test) {

            var input = PATH.resolve(basePath, test.file);
            var ext = PATH.extname(input);
            var output = PATH.resolve(basePath, test.file.replace(ext, '-out' + ext));
            var expect = PATH.resolve(basePath, test.file.replace(ext, '-expect-encodeURIComponent' + ext));

            it(test.name, function(cb) {

                // proccess it
                BORSCHIK
                    .api({
                        'comments': false,
                        'freeze': true,
                        'input': input,
                        'minimize': false,
                        'output': output,
                        'tech': 'css'
                    })
                    .then(function() {
                        try {
                            ASSERT.equal(
                                FS.readFileSync(output, 'utf-8'),
                                FS.readFileSync(expect, 'utf-8')
                            );
                            cb();
                        } catch(e) {
                            cb(e.toString());
                        }
                    })
                    .fail(function(e) {
                        cb(e.toString());
                    });
            });

        });
    });

});
