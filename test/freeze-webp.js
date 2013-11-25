var ASSERT = require('assert');
var FREEZE = require('..').freeze;
var BORSCHIK = require('..');
var FS = require('fs');

describe('WebP convert', function() {

    var path;

    before(function(){
        FREEZE.convertToWebp(FREEZE.realpathSync('test/freeze_webp/test.png'), 
            FREEZE.realpathSync('test/freeze_webp/test.webp'));
    });

    it('WebP convert ok', function() {
        var file = FS.readFileSync(FREEZE.realpathSync('test/freeze_webp/test.webp'));
        ASSERT.equal('G318N0xI85VMmocDE-OtCVLeQ94', FREEZE.fixBase64(FREEZE.sha1Base64(file)) );
    });

    after(function() {
        FS.unlinkSync(FREEZE.realpathSync('test/freeze_webp/test.webp'));
    });

});

describe('isConvertibleImage', function() {
    it('isConvertibleImage ok', function() {
        ASSERT.ok(FREEZE.isConvertibleImage('xxx.jpg'));
        ASSERT.ok(FREEZE.isConvertibleImage('xxx.jpeg'));
        ASSERT.ok(FREEZE.isConvertibleImage('xxx.png'));
        ASSERT.ok(!FREEZE.isConvertibleImage('xxx.ico'));
        ASSERT.ok(!FREEZE.isConvertibleImage('xxx.gif'));
        ASSERT.ok(!FREEZE.isConvertibleImage('xxx.svg'));
        ASSERT.ok(!FREEZE.isConvertibleImage('xxx.swf'));
        ASSERT.ok(!FREEZE.isConvertibleImage('xxx.ttf'));
        ASSERT.ok(!FREEZE.isConvertibleImage('xxx.eot'));
        ASSERT.ok(!FREEZE.isConvertibleImage('xxx.otf'));
        ASSERT.ok(!FREEZE.isConvertibleImage('xxx.woff'));
    });
});