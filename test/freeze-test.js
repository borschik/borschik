var BORSCHIK = require('..'),
    FREEZE = require('..').freeze,
    FS = BORSCHIK.require('./fs'),
    PATH = require('path'),
    ASSERT = require('assert'),

    testImagePath = 'test.png';

/**
 * Mocha BDD interface.
 */
/** @name describe @function */
/** @name it @function */
/** @name before @function */
/** @name after @function */
/** @name beforeEach @function */
/** @name afterEach @function */

function loadTestImage(path) {
    return readFile(path || testImagePath);
}

function readFile(path) {
    return FS.readFileSync(PATH.resolve(__dirname, path));
}

describe('sha1Base64', function() {
    var sha1base64;

    beforeEach(function() {
        sha1base64 = FREEZE.sha1Base64(loadTestImage());
    });

    it('sha1base64', function() {
        ASSERT.equal(sha1base64, 'wFPs+e1B3wMRud8TzGw7YHjS08I=');
    });
});

describe('fixBase64', function() {

    it('+-a+b/c=', function() {
        ASSERT.equal(FREEZE.fixBase64('+-a+b/c='), 'a-b_c');
    });
});

describe('loadConfig', function() {

    it('path', function() {
        ASSERT.equal(FREEZE.path(PATH.resolve(__dirname, 'config_load')), '//test/test/');
    });

    it('freezePath', function() {
        ASSERT.ok(FREEZE.freezePath(PATH.resolve(__dirname, 'config_load')));
    });

    it('freezeDir', function() {
        ASSERT.equal(FREEZE.freezeDir(PATH.resolve(__dirname, 'config_load/file.png')),
                     FREEZE.freezePath(PATH.resolve(__dirname, 'config_load')));
    });

});

describe('loadConfig empty', function() {

    it('path', function() {
        ASSERT.equal(FREEZE.path(PATH.resolve(__dirname, 'empty_config')), undefined);
    });

    it('freezePath', function() {
        ASSERT.equal(FREEZE.freezePath(PATH.resolve(__dirname, 'empty_config')), undefined);
    });

    it('freezeDir', function() {
        ASSERT.equal(FREEZE.freezeDir(PATH.resolve(__dirname, 'empty_config/file.png')), undefined);
    });

});

describe('freeze', function() {
    var path;

    it('freeze path ok', function() {
        path = FREEZE.freeze(FREEZE.realpathSync('test/freeze_basic/test.png'));
        ASSERT.ok(/\/test\/test2\/wFPs-e1B3wMRud8TzGw7YHjS08I\.png$/g.test(path));
    });

    after(function() {
        FS.unlinkSync(path);
        FS.rmdirSync(FREEZE.realpathSync('test/freeze_basic/test/test2'));
        FS.rmdirSync(FREEZE.realpathSync('test/freeze_basic/test'));
    });
});

describe('isFreezableUrl', function() {

    it('isFreezableUrl ok', function() {
        ASSERT.ok(FREEZE.isFreezableUrl('xxx.jpg'));
        ASSERT.ok(FREEZE.isFreezableUrl('xxx.jpeg'));
        ASSERT.ok(FREEZE.isFreezableUrl('xxx.ico'));
        ASSERT.ok(FREEZE.isFreezableUrl('xxx.png'));
        ASSERT.ok(FREEZE.isFreezableUrl('xxx.gif'));
        ASSERT.ok(FREEZE.isFreezableUrl('xxx.svg'));
        ASSERT.ok(FREEZE.isFreezableUrl('xxx.swf'));
        ASSERT.ok(FREEZE.isFreezableUrl('xxx.ttf'));
        ASSERT.ok(FREEZE.isFreezableUrl('xxx.eot'));
        ASSERT.ok(FREEZE.isFreezableUrl('xxx.otf'));
        ASSERT.ok(FREEZE.isFreezableUrl('xxx.woff'));
    });

});

function testFreeze(tech, dir, inPath, outPath, okPath, freeze, minimize) {
    inPath = PATH.resolve(PATH.join(__dirname, dir, inPath));
    outPath = PATH.resolve(PATH.join(__dirname, dir, outPath));
    okPath = PATH.resolve(PATH.join(__dirname, dir, okPath));

    before(function() {
        return BORSCHIK.api({ tech: tech, input: inPath, output: outPath, freeze: freeze, minimize: minimize });
    });

    it('freeze ' + tech + ' ok', function() {
        ASSERT.equal(readFile(outPath).toString(), readFile(okPath).toString());
    });

    after(function() {
        FS.unlinkSync(outPath);
        var rmPath = PATH.resolve(__dirname, dir, 'test/test2/wFPs-e1B3wMRud8TzGw7YHjS08I.png');
        if (FS.existsSync(rmPath)) FS.unlinkSync(rmPath);
        if (FS.existsSync(rmPath = FREEZE.realpathSync(PATH.join('test', dir, 'test/test2')))) {
            FS.rmdirSync(rmPath);
            FS.rmdirSync(FREEZE.realpathSync(PATH.join('test', dir, 'test')));
        }
    });
}

describe('freeze from .css (-t css)', function() {
    testFreeze('css', 'freeze_from_css', 'test.css', '_test.css', 'ok_css.css', true, false);
});

describe('freeze excepts from .css (-t css)', function() {
    testFreeze('css', 'freeze_excepts', 'test.css', '_test.css', 'ok_css.css', true, false);
});

describe('followSymlinks', function() {
    var linkPath = PATH.join(__dirname, 'freeze_follow_symlinks/link.png'),
        path;

    it('correct link', function() {
        FS.symlinkSync(PATH.resolve(__dirname, 'freeze_follow_symlinks/test.png'), linkPath);
        path = FREEZE.freeze(FREEZE.realpathSync('test/freeze_follow_symlinks/link.png'));
        ASSERT.ok(/\/test\/test2\/wFPs-e1B3wMRud8TzGw7YHjS08I\.png$/g.test(path));
    });

    after(function() {
        FS.unlinkSync(linkPath);
        FS.unlinkSync(path);
    });

});

describe('realpathSync', function() {

    it('realpath simple #0', function() {
        ASSERT.equal(FREEZE.realpathSync('freeze_basic/test.xxx', __dirname),
                     PATH.join(__dirname, '/freeze_basic/test.xxx'));
    });

    it('realpath simple #1', function() {
        ASSERT.equal(FREEZE.realpathSync('test/freeze_basic/test.xxx'),
                     PATH.join(__dirname, '/freeze_basic/test.xxx'));
    });

    it('realpath ..', function() {
        ASSERT.equal(FREEZE.realpathSync('../test/../borschik/test/freeze_basic/test.xxx'),
                     PATH.join(__dirname, '/freeze_basic/test.xxx'));
    });

});

describe('freeze options: yes', function() {
    var inPath = PATH.resolve(PATH.join(__dirname, 'freeze_basic', 'a.css')),
        outPath = PATH.resolve(PATH.join(__dirname, 'freeze_basic', 'o.css')),
        path = PATH.resolve(PATH.join(__dirname, 'freeze_basic', 'test', 'test2', 'wFPs-e1B3wMRud8TzGw7YHjS08I.png'));

    before(function() {
        return BORSCHIK.api({ tech: 'css', input: inPath, output: outPath, minimize: true });
    });

    it('freeze yes', function() {
        ASSERT.ok(FS.existsSync(outPath));
        ASSERT.ok(FS.existsSync(path));
    });

    after(function() {
        FS.unlinkSync(outPath);
        FS.unlinkSync(path);
        FS.rmdirSync(FREEZE.realpathSync('test/freeze_basic/test/test2'));
        FS.rmdirSync(FREEZE.realpathSync('test/freeze_basic/test'));
    });

});

describe('freeze options: no', function() {
    var inPath = PATH.resolve(PATH.join(__dirname, 'freeze_basic', 'a.css')),
        outPath = PATH.resolve(PATH.join(__dirname, 'freeze_basic', 'o.css')),
        path = PATH.resolve(PATH.join(__dirname, 'freeze_basic', 'test', 'test2', 'wFPs-e1B3wMRud8TzGw7YHjS08I.png'));

    before(function() {
        return BORSCHIK.api({ tech: 'css', input: inPath, output: outPath, freeze: false });
    });

    it('freeze no', function() {
        ASSERT.ok(FS.existsSync(outPath));
        ASSERT.ok(!FS.existsSync(path));
    });

    after(function() {
        FS.unlinkSync(outPath);
    });

});

describe('CSSO yes, tech css', function() {
    testFreeze('css', 'csso_test', 'a.css', '_a.css', 'ok_css.css', true, true);
});

function testJS(tech, dir, inPath, outPath, okPath) {
    inPath = PATH.resolve(PATH.join(__dirname, dir, inPath));
    outPath = PATH.resolve(PATH.join(__dirname, dir, outPath));
    okPath = PATH.resolve(PATH.join(__dirname, dir, okPath));

    before(function() {
        return BORSCHIK.api({ tech: tech, input: inPath, output: outPath, minimize: true });
    });

    it('UglifyJS, tech ' + tech + ' ok', function() {
        ASSERT.equal(readFile(outPath).toString(), readFile(okPath).toString());
    });

    after(function() {
        FS.unlinkSync(outPath);
    });
}

describe('UglifyJS yes, tech js', function() {
    testJS('js', 'uglifyjs_test', 'test.js', '_test.js', 'ok_js.js');
});

describe('freeze AlphaImageLoader from .css (-t css)', function() {
    testFreeze('css', 'freeze_alphaimageloader', 'test.css', '_test.css', 'ok_css.css', true, false);
});
