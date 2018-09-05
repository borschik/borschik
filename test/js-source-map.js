var assert = require('assert');
var path = require('path');
var fs = require('fs');
var borschik = require('..');

describe('js-source-maps:', function() {
    const basePath = path.resolve(__dirname, 'js-source-map');

    afterEach(function(cb) {
        require('child_process').exec('rm -rf ' + basePath + '/*-out.js*', function() {
            cb();
        });
    });

    const tests = [
        { name: 'should build correct source map', file: 'coffee.js' }
    ];

    tests.forEach(function(test) {
        var input = path.resolve(basePath, test.file);

        it(test.name, function(done) {
            var output = path.resolve(basePath, test.file.replace('.js', '-out.js'));
            var expect = path.resolve(basePath, test.file.replace('.js', '-expect.js'));

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

        it(test.name + ' when minification is enabled', function(done) {
            var output = path.resolve(basePath, test.file.replace('.js', '-min-out.js'));
            var expect = path.resolve(basePath, test.file.replace('.js', '-min-expect.js'));

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

        it(test.name + ' with string input', function(done) {
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
                    assert.equal(sourceMap, '{"version":3,"sources":["base.js","b.js"],"names":[],"mappings":"AAAA;AACA,AADA;AACA,ACDA,GDAA;AACA;AACA,AAFA;AACA;AACA","file":"string-input-out.js"}')
                    done()
                })
                .fail(function(error) {
                    done('assert error: ' + error);
                });
        });

        it(test.name + ' and optionally inline in the source', function(done) {
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
                        sourceMap: 'inline',
                        sourceMapRoot: basePath,
                        sourceMapFilename: 'string-input-out.js'
                    }
                })
                .spread(function(content) {
                    assert.equal(content, 'foo\n/* b.js begin */\nbar\n/* b.js end */\n\nbaz\n\n//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJhc2UuanMiLCJiLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0EsQUFEQTtBQUNBLEFDREEsR0RBQTtBQUNBO0FBQ0EsQUFGQTtBQUNBO0FBQ0EiLCJmaWxlIjoic3RyaW5nLWlucHV0LW91dC5qcyJ9')
                    done()
                })
                .fail(function(error) {
                    done('assert error: ' + error);
                });
        });
    });
});
