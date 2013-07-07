var ASSERT = require("assert");

describe('js-include:', function() {

    var PATH = require('path');
    var FS = require('fs');
    var BORSCHIK = require('..');

    const basePath = PATH.resolve(__dirname, 'js-include');

    afterEach(function(cb) {
        require('child_process').exec('rm -rf ' + basePath + '/*-out.js', function() {
            cb();
        });
    });

    const TESTS = [
        {name: 'should joins /* borschik:include: */', file: 'include1.js'},
        {name: 'should joins "borschik:include:"', file: 'include2.js'},
        {name: 'should save block comments in right place', file: 'include3.js'},
        {name: 'should save inline comments in right place', file: 'include4.js'}
    ];

    TESTS.forEach(function(test) {

        var input = PATH.resolve(basePath, test.file);
        var output = PATH.resolve(basePath, test.file.replace('.js', '-out.js'));
        var expect = PATH.resolve(basePath, test.file.replace('.js', '-expect.js'));

        it(test.name, function(cb) {

            // proccess it
            BORSCHIK
                .api({
                    'comments': false,
                    'freeze': false,
                    'input': input,
                    'minimize': false,
                    'output': output,
                    'tech': 'js'
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
                    cb(e.message);
                });
        });

    });

});
