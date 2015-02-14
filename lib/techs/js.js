var base = require('./css-base'),
    FS = require('fs'),
    PATH = require('path'),
    SourceMap = require('./../sourcemap');

exports.Tech = base.Tech.inherit({

    minimize: function(content) {
        var UglifyJS = require('uglify-js');
        try {
            var uglifyOptions = this.opts.techOptions.uglify || {};
            // redefine fronString
            uglifyOptions.fromString = true;

            if (this.sourceMap) {
                this.sourceMap.uglifyJsUpdateOptions(uglifyOptions);
            }

            var result = UglifyJS.minify(content, uglifyOptions);

            if (this.sourceMap && result.map) {
                this.sourceMap.uglifyJsSetMapping(result.map);
            }

            return result.code;

        } catch(e) {
            // creates better error message
            var uglifyError = e.message + " (line: " + e.line + ", col: " + e.col + ", pos: " + e.pos + ")";
            throw 'Error: ' + uglifyError
        }
    },

    File: exports.File = base.File.inherit({

        /**
         * @param {Buffer|String} content
         */
        parseInclude: function(content) {

            if (Buffer.isBuffer(content)) {
                content = content.toString('utf8');
            }

            var allIncRe = new RegExp([
                        ['\\{/\\*!?', '\\*/\\}'],
                        ['\\[/\\*!?', '\\*/\\]'],
                        ['/\\*!?', '\\*/'],
                        ['[\'"]', '[\'"]']
                    ]
                    .map(function(i) {
                        return ['(?:', i[0], '\\s*borschik:include:(.*?)\\s*', i[1], ')'].join('');
                    })
                    .join('|')
                    + '|' +
                    // RegExp to find borschik.link("path/to/image.png")
                    'borschik\\.link\\([\'"]([^@][^"\']+?)[\'"]\\)'
                    + '|' +
                    // RegExp to find borschik.include("path/to/file.js")
                    'borschik\\.include\\([\'"]([^@][^"\']+?)[\'"]\\)',
                    'g'),

                uniqStr = '\00borschik\00',
                _this = this;

            var includes = [],
                texts = content
                    // finds /*borschik:include:*/ and "borschik:include:"
                    .replace(allIncRe, function(_, incObjectFile, incArrayFile, incCommFile, incStrFile, borschikLink, borschikInc) {
                        var incFile = incObjectFile || incArrayFile || incCommFile || incStrFile || borschikInc;
                        if (incFile) {
                            includes.push({
                                file: _this.pathTo(incFile),
                                type: incStrFile? 'include-json' : 'include-inline',
                                content: _
                            });

                        } else {
                            includes.push({
                                file: _this.pathTo(borschikLink),
                                type: 'link-url',
                                content: _
                            });
                        }

                        return uniqStr;

                    })
                    .split(uniqStr);

            // zip texts and includes
            var res = [], t, i;
            while((t = texts.shift()) != null) {
                t && res.push(t);
                (i = includes.shift()) && res.push(i);
            }

            return res;

        },

        processInclude: function(baseFile, content) {
            var parsed = content || this.content;
            var original = { line: 1, column: 0 };
            var child;
            var item;
            var i;
            var isSourceMap = Boolean(this.tech.sourceMap);
            var isSourceMapGen = Boolean(isSourceMap && !this.__isIncludeInline);

            // дополнительные данные не изменяют курсор оригинального файла
            // и не участвуют в формировании карты
            // необходимы только для правильного сдвига курсора в собранном файле
            if (this.__isWrapComment) {
                var wrapFileName = PATH.relative(PATH.dirname(baseFile), this.path);

                parsed.unshift({
                    'type': 'additional',
                    'content': '/* ' + wrapFileName + ' begin */\n'
                });

                parsed.push({
                    'type': 'additional',
                    'content': '\n/* ' + wrapFileName + ' end */\n'
                });
            }

            for (i = 0; i < parsed.length; i++) {
                item = parsed[i];

                if (typeof(item) === 'string') {
                    if (isSourceMapGen) {
                        this.tech.sourceMap.addMapping(this, item, original.line, original.column);
                        this.tech.sourceMap.moveGeneratedCursor(item);
                        SourceMap.moveCursor(item, original);
                    }

                    continue;
                }

                if (item.type === 'additional') {
                    parsed[i] = item.content;

                    if (isSourceMapGen) {
                        this.tech.sourceMap.moveGeneratedCursor(item.content);
                    }

                    continue;
                }

                if (item.type === 'link-url') {
                    // freeze images with cssBase.processLink
                    child = this.child(item.type, item.file);
                    parsed[i] = child.process(baseFile);

                    if (isSourceMapGen) {
                        this.tech.sourceMap.addMapping(this, parsed[i], original.line, original.column);
                        this.tech.sourceMap.moveGeneratedCursor(parsed[i]);
                        SourceMap.moveCursor(item.content, original);
                    }

                    continue;
                }

                if (!FS.existsSync(item.file)) {
                    throw new Error('File ' + item.file + ' does not exists, base file is ' + baseFile);
                }

                child = this.child('include', item.file);
                child.__isWrapComment = Boolean(item.type === 'include-inline' && this.tech.opts.comments);
                child.__isIncludeInline = (item.type !== 'include-inline');

                parsed[i] = child.process(baseFile);

                if (isSourceMapGen) {
                    SourceMap.moveCursor(item.content, original);
                }
            }

            var out = parsed.join('');

            if (this.__isIncludeInline) {
                out = JSON.stringify(out);

                if (isSourceMap) {
                    this.tech.sourceMap.moveGeneratedCursor(out);
                }
            }

            return out;
        }

    })
});
