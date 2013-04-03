var ASSERT = require('assert');

describe('borschik freeze', function() {

    var PATH = require('path');
    var FS = require('fs');
    var BORSCHIK = require('..');
    var CP = require('child_process');

    const testDir = PATH.resolve(__dirname, 'borschik-freeze');
    const freezeDir = PATH.resolve(testDir, '_');
    const resFile = PATH.resolve(testDir, 'result.json');

    afterEach(function(cb) {
        CP.exec('rm -rf ' + [freezeDir, resFile].join(' '), function() {
            cb();
        });
    });

    it('should freeze all files in dir and subdirs', function(cb) {

        // proccess it
        BORSCHIK.api
            .freeze({
                'input': testDir,
                'output': resFile,
                'minimize': true
            })
            .then(function() {
                try {
                    var json = FS.readFileSync(resFile, 'utf-8');
                    var res = {
                        "borschik-freeze/.borschik": "borschik-freeze/.borschik",
                        "borschik-freeze/a.css": "//yandex.st/prj/_LWJmVQ8Q4Kn5C4mK3iYXHyieR7g.css",
                        "borschik-freeze/js/1.js": "//yandex.st/prj/_s2waZ-cd23dy_WqyHXmzbhscY_k.js",
                        "borschik-freeze/js/subdir/2.js": "//yandex.st/prj/_MGOy381jDKO0QzbHxeo46xQNEtQ.js",
                        "borschik-freeze/result.json": "borschik-freeze/result.json",
                        "borschik-freeze/test.png": "//yandex.st/prj/_wFPs-e1B3wMRud8TzGw7YHjS08I.png"
                    };
                    ASSERT.deepEqual(JSON.parse(json), res);
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
