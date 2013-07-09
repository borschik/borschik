var ASSERT = require("assert");

/**
 * @desc Test node API interface.
 * How use borshik in nodejs
 */

describe('js-node-api:', function() {
    var PATH = require('path');
    var FS = require('fs');
    var BORSCHIK = require('..');
    var processWrite = process.stdout.write;

    const basePath = PATH.resolve(__dirname, 'js-include');

    var testFileName = 'include1.js';
    var input = PATH.resolve(basePath, testFileName);
    var expect = PATH.resolve(basePath, testFileName.replace('.js', '-expect.js'));

    afterEach(function(cb) {
        process.stdout.write = processWrite;
        require('child_process').exec('rm -rf ' + basePath + '/*-out.js', function() {
            cb();
        });
    });

    it('should output file content by default in process.stdout', function(cb) {

        process.stdout.write = function(fileContent/*, encoding, fd*/) {
            processWrite.apply(process.stdout, arguments);
            process.stdout.write = processWrite;

            ASSERT.equal(fileContent, FS.readFileSync(expect, 'utf-8'));
        };

        // If we do not pass property `output` borshik by default
        // write result to process.stdout
        BORSCHIK.api({
            'input': input,
            'comments': false,
            'freeze': false,
            'minimize': false,
            'tech': 'js'
        }).then(cb.bind(null, null), cb);
    });

    it('should return file content in promise', function(cb) {

        BORSCHIK.api({
            'input': input,
            'comments': false,
            'freeze': false,
            'minimize': false,
            'tech': 'js'
        })
        .then(function(fileContent) {
            ASSERT.equal(fileContent, FS.readFileSync(expect, 'utf-8'));
        }).then(cb, cb);
    });

});
