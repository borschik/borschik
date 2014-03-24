describe('freeze.getFreezeNestingPath()', function() {

    var FREEZE = require('../lib/freeze.js');
    var ASSERT = require('assert');

    it('should return "abc" for ("abc", 0)', function() {
        ASSERT.equal(FREEZE.getFreezeNestingPath('abc', 0), 'abc');
    });

    it('should return "a/bc" for ("abc", 1)', function() {
        ASSERT.equal(FREEZE.getFreezeNestingPath('abc', 1), 'a/bc');
    });

    it('should return "a/b/c" for ("abc", 2)', function() {
        ASSERT.equal(FREEZE.getFreezeNestingPath('abc', 2), 'a/b/c');
    });

    it('should return "a/b/c" for ("abc", 4)', function() {
        ASSERT.equal(FREEZE.getFreezeNestingPath('abc', 4), 'a/b/c');
    });

});
