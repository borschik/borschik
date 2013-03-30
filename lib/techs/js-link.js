/**
 * @fileOverview Borschik tech to freeze images in js files.
 */

var INHERIT = require('borschik/node_modules/inherit');
var cssbase = require('borschik/lib/techs/css-base');

const uniqStr = '\00borschik\00';

/**
 * RegExp to find borschikFreeze("path/to/image.png")
 * @const
 * @type {RegExp}
 */
const allIncRe = /\/\/.*|\/\*[\s\S]*?\*\/|borschik\.link\(['"]([^@][^"']+?)['"]\)/g;

exports.Tech = INHERIT(cssbase.Tech, {

    minimize: function(content) {
        // no minimize for this tech
        return content;
    },

    File: exports.File = INHERIT(cssbase.File, {

        parseInclude: function(content) {

            var includes = [];
            var _this = this;

            var text = content instanceof Buffer ? content.toString('utf-8') : content;

            var texts = text
                .replace(allIncRe, function(_, include) {
                    if (include) {
                        includes.push({
                            url: _this.pathTo(include),
                            type: 'linkUrl'
                        });
                    } else {
                        includes.push({
                            file: _,
                            type: 'comment'
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

                if (typeof item == 'string') {
                    continue;
                }

                if (item.type == 'linkUrl') {
                    // freeze images with cssBase.processLink
                    parsed[i] = this.child(item.type, item.url).process(baseFile);

                } else {
                    parsed[i] = item.file;
                }
            }

            return parsed.join('');
        }

    })
});
