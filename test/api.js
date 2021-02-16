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

    describe('techOptions', function() {

        beforeEach(function() {
            var base = require('../lib/tech');

            this.emptyTech = {
                Tech: class extends base.Tech {
                    async process() {
                        return VOW.resolve(this.opts);
                    }
                }
            }
        });

        it('should accept techOptions as JSON-string', function() {
            return BORSCHIK.api({
                basePath: '.',
                inputString: 'var a = 1;',
                tech: this.emptyTech,
                techOptions: '{"a": 1}'
            }).then(function(opts) {
                ASSERT.deepEqual({a: 1}, opts.techOptions);
            });
        });

        it('should accept techOptions as object', function() {
            return BORSCHIK.api({
                basePath: '.',
                inputString: 'var a = 1;',
                tech: this.emptyTech,
                techOptions: {"a": 1}
            }).then(function(opts) {
                ASSERT.deepEqual({a: 1}, opts.techOptions);
            });
        });

        it('should reject if techOptions is not a valid JSON', function() {
            return BORSCHIK.api({
                basePath: '.',
                inputString: 'var a = 1;',
                tech: this.emptyTech,
                techOptions: '{a: 1}'
            }).then(function() {
                return VOW.reject('fulfilled');

            }, function(e) {
                return VOW.resolve();
            });
        });

    })

});
