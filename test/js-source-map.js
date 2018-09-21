var assert = require('assert');
var path = require('path');
var fs = require('fs');
var borschik = require('..');

describe.only('js-source-maps:', function() {
    const basePath = path.resolve(__dirname, 'js-source-map');

    afterEach(function(cb) {
        require('child_process').exec('rm -rf ' + basePath + '/*-out.js*', function() {
            cb();
        });
    });

    it('builds source map correctly when input is a string', function(done) {
        borschik
            .api({
                comments: true,
                freeze: false,
                basePath: basePath,
                baseFilename: 'base.js',
                inputString: 'foo\n/* borschik:include:./b.js */\nbaz\n',
                minimize: false,
                tech: 'js',
                techOptions: {
                    inputSourceMap: 'file',
                    sourceMap: 'file',
                    sourceMapRoot: basePath,
                    sourceMapFilename: 'string-input-out.js',
                    sourceMapURL: false
                }
            })
            .spread(function(content, sourceMap) {
                assert.equal(content, 'foo\n/* b.js begin */\nbar\n/* b.js end */\n\nbaz\n')
                assert.equal(sourceMap, '{"version":3,"sources":["base.js","b.js"],"names":[],"mappings":"AAAA;AACA;ACDA,GDCA;AAAA;AAAA;AACA","file":"string-input-out.js"}')
                done()
            })
            .fail(function(error) {
                done('assert error: ' + error);
            });
    });

    it('optionally inlines source map in the sources', function(done) {
        borschik
            .api({
                comments: false,
                freeze: false,
                basePath: basePath,
                baseFilename: 'base.js',
                inputString: 'foo\n/* borschik:include:./b.js */\nbaz\n',
                minimize: false,
                tech: 'js',
                techOptions: {
                    inputSourceMap: 'file',
                    sourceMap: 'inline',
                    sourceMapRoot: basePath,
                    sourceMapFilename: 'string-input-out.js'
                }
            })
            .spread(function(content) {
                assert.equal(content, 'foo\nbar\nbaz\n\n//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJhc2UuanMiLCJiLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsR0RDQTtBQUNBIiwiZmlsZSI6InN0cmluZy1pbnB1dC1vdXQuanMifQ==')
                done()
            })
            .fail(function(error) {
                done('assert error: ' + error);
            });
    });

    it('builds source map correctly for include-only files', function(done) {
        var file = 'include.js';
        var input = path.resolve(basePath, file);
        var output = path.resolve(basePath, file.replace('.js', '-out.js'));
        var expect = path.resolve(basePath, file.replace('.js', '-expect.js'));

        borschik
            .api({
                comments: false,
                freeze: false,
                input: input,
                minimize: false,
                output: output,
                tech: 'js',
                techOptions: {
                    inputSourceMap: 'file',
                    sourceMap: 'file',
                    sourceMapRoot: basePath,
                    sourceMapFilename: 'include-out.js'
                }
            })
            .then(function() {
                try {
                    assert.equal(
                        fs.readFileSync(output, 'utf-8'),
                        fs.readFileSync(expect, 'utf-8')
                    );
                    assert.equal(
                        fs.readFileSync(output + '.map', 'utf-8'),
                        fs.readFileSync(expect + '.map', 'utf-8')
                    );
                    done();
                } catch(e) {
                    done(e);
                }
            }, function(error) {
                done([
                    'borschik error',
                    error.message,
                    error.stack
                ].join('\n'));
            })
            .fail(function(error) {
                done('assert error: ' + error);
            });
    });

    it('builds source map correctly for multiple includes of the same file', function(done) {
        var file = 'include-multiple.js';
        var input = path.resolve(basePath, file);
        var output = path.resolve(basePath, file.replace('.js', '-out.js'));
        var expect = path.resolve(basePath, file.replace('.js', '-expect.js'));

        borschik
            .api({
                comments: false,
                freeze: false,
                input: input,
                minimize: false,
                output: output,
                tech: 'js',
                techOptions: {
                    inputSourceMap: 'file',
                    sourceMap: 'file',
                    sourceMapRoot: basePath,
                    sourceMapFilename: 'include-multiple-out.js'
                }
            })
            .then(function() {
                try {
                    assert.equal(
                        fs.readFileSync(output, 'utf-8'),
                        fs.readFileSync(expect, 'utf-8')
                    );
                    assert.equal(
                        fs.readFileSync(output + '.map', 'utf-8'),
                        fs.readFileSync(expect + '.map', 'utf-8')
                    );
                    done();
                } catch(e) {
                    done(e);
                }
            }, function(error) {
                done([
                    'borschik error',
                    error.message,
                    error.stack
                ].join('\n'));
            })
            .fail(function(error) {
                done('assert error: ' + error);
            });
    });

    it('builds source map correctly when input source map is present', function(done) {
        var file = 'coffee.js';
        var input = path.resolve(basePath, file);
        var output = path.resolve(basePath, file.replace('.js', '-out.js'));
        var expect = path.resolve(basePath, file.replace('.js', '-expect.js'));

        borschik
            .api({
                comments: false,
                freeze: false,
                input: input,
                minimize: false,
                output: output,
                tech: 'js',
                techOptions: {
                    inputSourceMap: 'file',
                    sourceMap: 'file',
                    sourceMapRoot: basePath,
                    sourceMapFilename: 'coffee-out.js'
                }
            })
            .then(function() {
                try {
                    assert.equal(
                        fs.readFileSync(output, 'utf-8'),
                        fs.readFileSync(expect, 'utf-8')
                    );
                    assert.equal(
                        fs.readFileSync(output + '.map', 'utf-8'),
                        fs.readFileSync(expect + '.map', 'utf-8')
                    );
                    done();
                } catch(e) {
                    done(e);
                }
            }, function(error) {
                done([
                    'borschik error',
                    error.message,
                    error.stack
                ].join('\n'));
            })
            .fail(function(error) {
                done('assert error: ' + error);
            });
    });

    it('builds source map correctly when minification is enabled', function(done) {
        var file = 'coffee.js';
        var input = path.resolve(basePath, file);
        var output = path.resolve(basePath, file.replace('.js', '-min-out.js'));
        var expect = path.resolve(basePath, file.replace('.js', '-min-expect.js'));

        borschik
            .api({
                comments: false,
                freeze: false,
                input: input,
                minimize: true,
                output: output,
                tech: 'js',
                techOptions: {
                    inputSourceMap: 'file',
                    sourceMap: 'file',
                    sourceMapRoot: basePath,
                    sourceMapFilename: 'coffee-min-out.js'
                }
            })
            .then(function() {
                try {
                    assert.equal(
                        fs.readFileSync(output, 'utf-8'),
                        fs.readFileSync(expect, 'utf-8')
                    );
                    assert.equal(
                        fs.readFileSync(output + '.map', 'utf-8'),
                        fs.readFileSync(expect + '.map', 'utf-8')
                    );
                    done();
                } catch(e) {
                    done(e);
                }
            }, function(error) {
                done([
                    'borschik error',
                    error.message,
                    error.stack
                ].join('\n'));
            })
            .fail(function(error) {
                done('assert error: ' + error);
            });
    });
});
