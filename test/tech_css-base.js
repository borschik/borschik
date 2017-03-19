describe('lib/techs/css-base', function() {
    var ASSERT = require("assert");
    var cssBase = require('../lib/techs/css-base.js');

    describe('File#proccessLink', function() {

        beforeEach(function() {
            this.tech = new cssBase.Tech({});
        });

        afterEach(function() {
            delete this.file;
            delete this.tech;
        });

        it('should save GET-query string', function() {
            this.file = new cssBase.File(this.tech, '1.css?foo=bar', {});
            ASSERT.equal(this.file.processLink('.'), '"1.css?foo=bar"')
        });

        it('should save hash string', function() {
            this.file = new cssBase.File(this.tech, '1.css#foo', {});
            ASSERT.equal(this.file.processLink('.'), '"1.css#foo"')
        });

        it('should save GET-query and hash string', function() {
            this.file = new cssBase.File(this.tech, '1.css?foo=bar#bar', {});
            ASSERT.equal(this.file.processLink('.'), '"1.css?foo=bar#bar"')
        });
    });

});
