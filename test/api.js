describe('API', function() {

    var ASSERT = require('assert');
    var BORSCHIK = require('..');
    var VOW = require('vow');

    describe('inputString', function() {
        it('should throw error for "input" and "inputString" options at the same time', function() {
            return BORSCHIK.api({
                input: 'file.js',
                inputString: 'var a = 1;',
                basePath: '.'
            }).then(function() {
                return VOW.reject('passed');
            }, function(err) {
                ASSERT.equal("Can't process 'input' and 'inputString' options at the same time", err);
                return VOW.resolve();
            });
        });

        it('should throw error for "inputString" option without "basePath', function() {
            return BORSCHIK.api({
                inputString: 'var a = 1;'
            }).then(function() {
                return VOW.reject('passed');
            }, function(err) {
                ASSERT.equal("Can't process 'inputString' without 'basePath' option", err);
                return VOW.resolve();
            });
        });

        it('should process "inputString" with "basePath', function() {
            return BORSCHIK.api({
                inputString: 'var a = 1;',
                basePath: '.'
            }).then(function(res) {
                ASSERT.equal("var a = 1;", res);
            });
        });
    });

});
