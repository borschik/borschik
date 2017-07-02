var fs = require('fs');
var PATH = require('path');

var base = require('./css-base');
var error = require('../error');

exports.Tech = base.Tech.inherit({
    minimize: function(content) {
        var UglifyJS = require('uglify-es');
        try {
            var uglifyOptions = this.opts.techOptions.uglify || {};

            var res = UglifyJS.minify(content, uglifyOptions);

            if (res.error) throw res.error;

            return res.code;

        } catch(e) {
            // create better error message
            var lines = content.split('\n');
            throw error.explain(lines, e);
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
                'g');

            var uniqStr = '\00borschik\00';
            var _this = this;

            var includes = [];
            var texts = content
                // finds /*borschik:include:*/ and "borschik:include:"
                .replace(allIncRe, function(_, incObjectFile, incArrayFile, incCommFile, incStrFile, borschikLink, borschikInc) {
                    var incFile = incObjectFile || incArrayFile || incCommFile || incStrFile || borschikInc;
                    if (incFile) {
                        includes.push({
                            file: _this.pathTo(incFile),
                            type: incStrFile? 'include-json' : 'include-inline'
                        });

                    } else {
                        includes.push({
                            file: _this.pathTo(borschikLink),
                            type: 'link-url'
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

            for(var i = 0; i < parsed.length; i++) {
                var item = parsed[i];

                if (typeof item === 'string') {
                    continue;
                }

                if (item.type == 'link-url') {
                    // freeze images with cssBase.processLink
                    parsed[i] = this.child(item.type, item.file).process(baseFile);
                    continue;
                }

                if (!fs.existsSync(item.file)) {
                    throw new Error('File ' + item.file + ' does not exists, base file is ' + baseFile);
                }

                var processed = this.child('include', item.file).process(baseFile);
                var result;
                if (item.type === 'include-inline') {
                    if (this.tech.opts.comments) {
                        result = commentsWrap(processed, PATH.relative(PATH.dirname(baseFile), item.file));
                    } else {
                        result = processed;
                    }
                } else {
                    result = JSON.stringify(processed);
                }
                parsed[i] = result;
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
