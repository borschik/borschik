var INHERIT = require('inherit'),
    base = require('../tech'),
    FS = require('../fs');

exports.Tech = INHERIT(base.Tech, {

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
                parsed[i] = (item.type === 'comment'? processed : JSON.stringify(processed));
            }

            return parsed.join('');
        }

    })
});
