var ASSERT = require('assert');

describe('techs/json', function() {

    var PATH = require('path');
    var FS = require('fs');
    var BORSCHIK = require('..');
    var CP = require('child_process');

    const basePath = PATH.resolve(__dirname, 'js-link');
    const fakeFile = PATH.resolve(basePath, 'test.json');
    const fakeResFile = PATH.resolve(basePath, '_test.json');
    const freezeDir = PATH.resolve(basePath, '_');

    afterEach(function(cb) {
        CP.exec('rm -rf ' + [freezeDir, fakeFile, fakeResFile].join(' '), function() {
            cb();
        });
    });

    const TESTS = [
        // simple json
        {
            'in': '{"img1": "1.png","css": "1.css"}',
            'out': '{"img1":"//yandex.st/prj/_/jUK5O9GsS2gPWOhRMeBxR0GThf0.png","css":"//yandex.st/prj/_/ZJqDxMPcZv60k4hy26rNTMwYFzc.css"}'
        }
    ];

    TESTS.forEach(function(test, i) {
        it('json test ' + i, function(cb) {

            // write test file
            FS.writeFileSync(fakeFile, test.in, 'utf-8');

            // proccess it
            BORSCHIK
                .api({
                    'freeze': true,
                    'input': fakeFile,
                    'minimize': true,
                    'output': fakeResFile,
                    'tech': 'json'
                })
                .then(function() {
                    try {
                        ASSERT.equal(FS.readFileSync(fakeResFile, 'utf-8'), test.out);
                        cb();
                    } catch(e) {
                        cb(e);
                    }
                })
                .fail(cb);
        });

        it('process as string json test ' + i, function(cb) {

            // proccess it
            BORSCHIK
                .api({
                    'freeze': true,
                    'inputString': test.in,
                    'basePath': basePath,
                    'minimize': true,
                    'tech': 'json'
                })
                .then(function(result) {
                    try {
                        result
                        cb();
                    } catch(e) {
                        cb(e);
                    }
                })
                .fail(cb);
        })
    });

});
