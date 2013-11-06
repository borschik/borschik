var base = require('./css-base'),
    FS = require('../fs'),
    PATH = require('path');

exports.Tech = base.Tech.inherit({

    minimize: function(content) {
        var uglifyOpts = {
            fromString: true
        };

        // TODO: uglify -> inSourceMap
//        if (this.opts.sourceMap) {
//            uglifyOpts.inSourceMap = this.sourceMap.toJSON();
//            uglifyOpts.outSourceMap = this.sourceMap.file;
//        }

        var result = require('uglify-js').minify(content, uglifyOpts);
//        if (result.map) {
//            this.sourceMap.replace(result.map);
//        }

        return result.code;
    },

    sourceMappingURL: function(path, content) {
        return content + '\n//# sourceMappingURL=' + path;
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
                    'borschik\\.link\\([\'"]([^@][^"\']+?)[\'"]\\)',
                    'g'),

                uniqStr = '\00borschik\00',
                _this = this;

            var includes = [],
                texts = content
                    // finds /*borschik:include:*/ and "borschik:include:"
                    .replace(allIncRe,
                            function(match, incObjectFile, incArrayFile, incCommFile, incStrFile, borschikLink, offset) {
                        var incFile = incObjectFile || incArrayFile || incCommFile || incStrFile;
                        if (incFile) {
                            includes.push({
                                file: _this.pathTo(incFile),
                                type: incStrFile? 'include-json' : 'include-inline',
                                content: match
                            });

                        } else {
                            includes.push({
                                file: _this.pathTo(borschikLink),
                                type: 'link-url',
                                content: match
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
            var parsed = content || this.content,
                mapPath = this.path,
                original = {
                    line: 1,
                    column: 0
                },
                generated = {
                    line: 1,
                    column: 0
                },
                line, column;

            function moveCursor(content, cursor) {
                var lines = content.split('\n');

                cursor.line += lines.length - 1;

                var lastLine = lines.pop();
                if (lines.length) {
                    cursor.column = lastLine.length;
                } else {
                    cursor.column += lastLine.length;
                }

                return cursor;
            }

            for(var i = 0; i < parsed.length; i++) {
                var item = parsed[i],
                    processed;

                line = generated.line;
                column = generated.column;

                if (typeof item === 'string') {
                    this.addMapping(mapPath, line, column, original.line, original.column, item);

                    moveCursor(item, original);
                    moveCursor(item, generated);

                    continue;
                }

                if (item.type === 'link-url') {
                    // freeze images with cssBase.processLink
                    parsed[i] = this.child(item.type, item.file).process(baseFile);

                    this.addMapping(mapPath, line, column, original.line, original.column, parsed[i]);

                    moveCursor(parsed[i], generated);
                    moveCursor(item.content, original);

                    continue;
                }

                if (!FS.existsSync(item.file)) {
                    throw new Error('File ' + item.file + ' does not exists, base file is ' + baseFile);
                }

                var child = this.child('include', item.file),
                    result;

                processed = child.process(baseFile);

                if (item.type === 'include-inline') {

                    if (this.tech.opts.comments) {
                        result = commentsWrap(processed, PATH.relative(PATH.dirname(baseFile), item.file));
                        // comment "begin"
                        ++line;
                        // this makes sense only if comments inserted
                        column = 0;
                    } else {
                        result = processed;
                    }

                    // NOTE: reduce `line` offset with 1,
                    // because we're replacing content of `include`-token,
                    // not adding new one
                    this.combineMaps(child.map, { line: line - 1, column: column });
                } else {
                    result = JSON.stringify(processed);
                    this.combineMaps(child.map, { line: line - 1, column: column }, true);
                }
                parsed[i] = result;

                moveCursor(result, generated);
                moveCursor(item.content, original);
            }

            return parsed.join('');
        }

    })
});

function commentsWrap(content, file) {

    return '/* ' + file + ' begin */\n' +
        content +
        '\n/* ' + file + ' end */\n';

}
