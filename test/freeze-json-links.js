var ASSERT = require('assert');

describe('techs/json-links', function() {

    var PATH = require('path');
    var FS = require('fs');
    var BORSCHIK = require('..');
    var CP = require('child_process');

    const fakeFile = PATH.resolve(__dirname, 'js-link/test.json');
    const fakeResFile = PATH.resolve(__dirname, 'js-link/_test.json');
    const freezeDir = PATH.resolve(__dirname, 'js-link/_');

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
        it('json-links test ' + i, function(cb) {

            // write test file
            FS.writeFileSync(fakeFile, test.in, 'utf-8');

            // proccess it
            BORSCHIK
                .api({
                    'freeze': true,
                    'input': fakeFile,
                    'minimize': true,
                    'output': fakeResFile,
                    'tech': 'json-links'
                })
                .then(function() {
                    try {
                        ASSERT.equal(FS.readFileSync(fakeResFile, 'utf-8'), test.out);
                        cb();
                    } catch(e) {
                        cb(e.toString());
                    }
                })
                .fail(function(e) {
                    cb(e.message)
                });
        })
    });

});
