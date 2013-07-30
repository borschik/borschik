var ASSERT = require("assert");

describe('follow_symlinks', function() {

    var PATH = require('path');
    var FS = require('fs');
    var BORSCHIK = require('..');

    const resultFile = PATH.resolve(__dirname, 'follow_symlinks/result.css');
    const borschikConfig = PATH.resolve(__dirname, 'follow_symlinks/.borschik');
    const borschikTestConfig = PATH.resolve(__dirname, 'follow_symlinks/borschik_follow_symlinks.json');

    beforeEach(function() {
        delete require.cache['borschik'];
    });

    afterEach(function() {
        try {
            FS.unlinkSync(resultFile);
        } catch(e){}
        try {
            FS.unlinkSync(borschikConfig);
        } catch(e) {}

        // clear cached configs
        BORSCHIK.freeze.clearConfigCache();
    });

    const TESTS = [
        {
            'name': 'follow dir-symlink for input file (CSS)',
            'in': 'test/follow_symlinks/dir/css/test.css',
            'out': '.a{margin:0}'
        },

        {
            'name': 'follow dir-symlink for input file (JS)',
            'in': 'test/follow_symlinks/dir/js/test.js',
            'out': 'var a=1;'
        },

        {
            'name': 'follow symlink for input file (CSS)',
            'in': 'test/follow_symlinks/dir/test.css',
            'out': '.a{margin:0}'
        },

        {
            'name': 'follow symlink for input file (JS)',
            'in': 'test/follow_symlinks/dir/test.js',
            'out': 'var a=1;'
        },

        {
            'name': 'follow symlink for included file (CSS)',
            'in': 'test/follow_symlinks/dir/real.css',
            'out': '.a{margin:0}'
        },

        {
            'name': 'follow symlink for included file (JS)',
            'in': 'test/follow_symlinks/dir/real.js',
            'out': 'var a=1;'
        },

        {
            'name': 'follow symlink in the same dir with real path (JS)',
            'in': 'test/follow_symlinks/dir/include-from-symlink.js',
            'out': 'var ruJS=!0,stop=!0;'
        }
    ];

    TESTS.forEach(function(test) {
        it('should process ' + test.name, function(cb) {

            FS.symlinkSync(borschikTestConfig, borschikConfig);

            // proccess it
            BORSCHIK
                .api({
                    'freeze': false,
                    'input': test.in,
                    'minimize': true,
                    'output': resultFile
                })
                .then(function() {
                    try {
                        ASSERT.equal(FS.readFileSync(resultFile, 'utf-8'), test.out);
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

    TESTS.forEach(function(test) {
        it('should fail to process ' + test.name + 'because not follow symlinks', function(cb) {

            // proccess it
            BORSCHIK
                .api({
                    'freeze': false,
                    'input': test.in,
                    'minimize': true,
                    'output': resultFile
                })
                .then(function() {
                    cb('process successfully');
                })
                .fail(function() {
                    // should fail
                    cb();
                });
        })
    });

});
