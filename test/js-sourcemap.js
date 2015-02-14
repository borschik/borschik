var ASSERT = require('assert');

describe('js-sourcemap:', function() {

    var PATH = require('path');
    var FS = require('fs');
    var VOW = require('vow');
    var BORSCHIK = require('..');
    var SOURCEMAP = require('source-map');

    var basePath = PATH.resolve(__dirname, 'js-sourcemap');

    afterEach(function(cb) {
        var promiseOut = VOW.promise();
        var promiseMap = VOW.promise();

        require('child_process').exec('rm -rf ' + basePath + '/*.out.js', function() {
            promiseOut.fulfill();
        });

        require('child_process').exec('rm -rf ' + basePath + '/*.map.js', function() {
            promiseMap.fulfill();
        });

        VOW.all([ promiseOut, promiseMap ]).then(function() {
            cb();
        });
    });

    var TESTS = [
        {
            descr: 'С комментариями',
            params: {
                'comments': true,
                'freeze': false,
                'minimize': false,
                'tech': 'js'
            },
            tests: [
                { name: 'Строка собранного файла и должна должна быть равна строке оригинального', file: 'sourcemap-1.js' },
                { name: 'Текстовый файл не участвует в построении sourcemap', file: 'sourcemap-2.js' },
                { name: 'Глубокая вложенность файлов', file: 'sourcemap-3.js' },
                { name: 'Подключение файлов в со смещением по столбцам', file: 'sourcemap-4.js' },
                { name: 'link-url', file: 'sourcemap-5.js' },
                { name: 'Подключение JSON файла', file: 'sourcemap-6.js' },
                { name: 'Подключение многострочного файла в виде одной строки', file: 'sourcemap-7.js' }
            ]
        },

        {
            descr: 'Без комментариев',
            params: {
                'comments': false,
                'freeze': false,
                'minimize': false,
                'tech': 'js'
            },
            tests: [
                { name: 'Строка собранного файла и должна должна быть равна строке оригинального', file: 'sourcemap-1.js' },
                { name: 'Текстовый файл не участвует в построении sourcemap', file: 'sourcemap-2.js' },
                { name: 'Глубокая вложенность файлов', file: 'sourcemap-3.js' },
                { name: 'Подключение файлов в со смещением по столбцам', file: 'sourcemap-4.js' },
                { name: 'link-url', file: 'sourcemap-5.js' },
                { name: 'Подключение JSON файла', file: 'sourcemap-6.js' },
                { name: 'Подключение многострочного файла в виде одной строки', file: 'sourcemap-7.js' }
            ]
        }
    ];

    TESTS.forEach(function(testData) {
        var testParams = testData.params;

        testData.tests.forEach(function(test) {
            var input = PATH.resolve(basePath, test.file);
            var output = PATH.resolve(basePath, test.file.replace('.js', '.out.js'));
            var sourcemap = PATH.resolve(basePath, test.file.replace('.js', '.map.js'));
            var expect = PATH.resolve(basePath, test.file.replace('.js', '.expect.js'));

            it(testData.descr + ' - ' + test.name, function(cb) {
                testParams.input = input;
                testParams.output = output;
                testParams.sourceMap = sourcemap;

                BORSCHIK
                    .api(testParams)
                    .then(function() {
                        try {
                            var sources = {};
                            var out = FS.readFileSync(output, 'utf-8').split('\n');
                            var map = JSON.parse(FS.readFileSync(sourcemap, 'utf-8'));
                            var smc = new SOURCEMAP.SourceMapConsumer(map);

                            var generated;
                            var original;

                            smc.eachMapping(function(m, idx, maps) {
                                if (!sources.hasOwnProperty(m.source)) {
                                    sources[ m.source ] = FS.readFileSync(m.source, 'utf-8').split('\n');
                                }

                                generated = out[ m.generatedLine - 1 ].substr(m.generatedColumn, m.name.length);
                                original = sources[ m.source ][ m.originalLine - 1 ].substr(m.originalColumn, m.name.length);

                                ASSERT.equal(generated, m.name);
                                ASSERT.equal(original, m.name);
                            });

                            cb();
                        } catch(e) {
                            cb(e);
                        }

                    }, function(error) {
                        cb([
                            'borschik error',
                            error.message,
                            error.stack
                        ].join('\n'));

                    })
                    .fail(function(error) {
                        cb('assert error: ' + error);
                    });
            });

        });

    });

});
