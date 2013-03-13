var INHERIT = require('inherit'),
    base = require('../tech'),
    FS = require('../fs'),
    PATH = require('path');

exports.Tech = INHERIT(base.Tech, {

    minimize: function(content) {
        return require('uglify-js')(content);
    },

    File: exports.File = INHERIT(base.File, {

        parseInclude: function(content) {

            if (Buffer.isBuffer(content)) content = content.toString('utf8');

            var allIncRe = new RegExp([
                        ['/\\*!?', '\\*/'],
                        ['[\'"]', '[\'"]']
                    ]
                    .map(function(i) {
                        return ['(?:', i[0], '\\s*borschik:include:(.*?)\\s*', i[1], ')'].join('');
                    })
                    .join('|'), 'g'),

                uniqStr = '\00borschik\00',
                _this = this;

            var includes = [],
                texts = content
                    .replace(allIncRe, function(_, incCommFile, incStrFile) {

                        var incFile = incCommFile || incStrFile;

                        includes.push({
                            file: _this.pathTo(incFile),
                            type: incStrFile? 'string' : 'comment'
                        });

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

                if(typeof item === 'string') continue;

                if(!FS.existsSync(item.file)) {
                    throw new Error('File ' + item.file + ' does not exists, base file is ' + baseFile);
                }

                var processed = this.child('include', item.file).process(baseFile);
                var result;
                if (item.type === 'comment') {
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
