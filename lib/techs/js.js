var INHERIT = require('inherit'),
    base = require('../tech.js'),
    path = require('path'),
    util = require('util'),
    fs = require('fs');

Tech = exports.Tech = INHERIT(base.Tech, {
    File: INHERIT(base.File, {

        __constructor: function(tech, path, type, parent) {
            this.__base(tech, path, type, parent);
        },

        parseInclude: function(content) {
            var allIncRe = new RegExp(
                [
                    ['/\\*!?', '\\*/'],
                    ['[\'"]', '[\'"]']
                ]
                    .map(function(i) {
                    return ['(?:', i[0], '\\s*borschik:include:(.*?)\\s*', i[1], ')'].join('')
                })
                    .join('|'),
                'g'),
                uniqStr = '\00borschik\00',
                _this = this;

            content = '' + content;

            var incs = [];
            texts = content
                .replace(allIncRe, function(_, incCommFile, incStrFile) {
                var incFile = incCommFile || incStrFile,
                    resultFile = path.join(path.dirname(_this.path), incFile);
                incs.push({
                    file: resultFile,
                    type: incStrFile ? 'string' : 'comment' });
                return uniqStr
            })
                .split(uniqStr)

            // zip texts and includes
            var res = [], t, i;
            while((t = texts.shift()) != null) {
                t && res.push(t);
                (i = incs.shift()) && res.push(i);
            }

            return res
        },

        processInclude: function(baseFile, content) {
            var parsed = content || this.content;

            for(var i = 0; i < parsed.length; i++) {
                var item = parsed[i];

                if(typeof item !== 'string') {
                    if(path.existsSync(item.file)) {
                        var processed =
                            this.processInclude(
                                item.file,
                                this.parseInclude(fs.readFileSync(item.file)));

                        parsed[i] = (item.type === 'comment' ?
                            processed :
                            JSON.stringify(processed));
                    } else {
                        util.error('Base file: ' + baseFile);
                        util.error('Include file: ' + item.file);
                        throw 'File not exists'
                    }
                }
            }

            return parsed.join('');
        },

        processLink: function(path) {
            return this.pathFrom(path);
        }

    })
});