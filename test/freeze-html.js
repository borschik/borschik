var ASSERT = require("assert");

describe('freeze-html', function() {

    var PATH = require('path');
    var FS = require('fs');
    var BORSCHIK = require('..');

    const fakeFile = PATH.resolve(__dirname, 'freeze_html/test.html');
    const fakeResFile = PATH.resolve(__dirname, 'freeze_html/_test.html');
    const freezeDir = PATH.resolve(__dirname, 'freeze_html/_');

    afterEach(function(cb) {
        require('child_process').exec('rm -rf ' + [freezeDir, fakeFile, fakeResFile].join(' '), function() {
            cb();
        });
    });

    const TESTS = [
        {
            'name': 'link@href',
            'in': '<link rel="stylesheet" href="1.css"/>',
            'out': '<link rel="stylesheet" href="//yandex.st/prj/_/gKaG181G8PenscQiAxl262QG4h0.css"/>'
        },
        {
            'name': 'img@src',
            'in': '<img src="1.png">',
            'out': '<img src="//yandex.st/prj/_/jUK5O9GsS2gPWOhRMeBxR0GThf0.png">'
        },
        {
            'name': 'script@src',
            'in': '<script src="1.js"></script>',
            'out': '<script src="//yandex.st/prj/_/fAGyjAG9Y6UYcFPXLNWD849MyY.js"></script>'
        },
        {
            'name': 'one line comment',
            'in': '<!-- <script src="1.js"></script> -->',
            'out': '<!-- <script src="1.js"></script> -->'
        },
        {
            'name': 'several line comment',
            'in': '<!--\n<script src="1.js"></script>\n-->',
            'out': '<!--\n<script src="1.js"></script>\n-->'
        }
    ];

    TESTS.forEach(function(test) {
        it('should process ' + test.name, function(cb) {

            // write test file
            FS.writeFileSync(fakeFile, test.in, 'utf-8');

            // proccess it
            BORSCHIK
                .api({
                    'freeze': true,
                    'input': fakeFile,
                    'minimize': true,
                    'output': fakeResFile,
                    'tech': 'lib/techs/html'
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
                    cb(e.message);
                });
        })
    });

});
