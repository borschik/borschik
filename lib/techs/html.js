/**
 * @fileOverview Borschik tech to freeze files in HTML.
 */

process.env.BORSCHIK_FREEZABLE_EXTS = 'jpg jpeg gif ico png swf svg ttf eot otf woff css js swf';

var INHERIT = require('borschik/node_modules/inherit');
var CSSBASE = require('borschik/lib/techs/css-base');
var FREEZE = require('borschik/lib/freeze');

const uniqStr = '\00borschik\00';

/**
 * RegExp to find href="1.css" | src="1.js"
 * @const
 * @type {RegExp}
 */
const allIncRe = /<!--[\s\S]*?-->|href="(.+?)"|src="(.+?)"/g;

exports.Tech = INHERIT(CSSBASE.Tech, {

    minimize: function(content) {
        // no minimize for this tech
        return content;
    },

    File: exports.File = INHERIT(CSSBASE.File, {

        parseInclude: function(content) {

            var includes = [];
            var _this = this;

            var text = content instanceof Buffer ? content.toString('utf-8') : content;

            var texts = text
                .replace(allIncRe, function(_, includeHref, includeSrc) {
                    if (includeHref && FREEZE.isFreezableUrl(includeHref)) {
                        includes.push({
                            url: _this.pathTo(includeHref),
                            type: 'href'
                        });

                    } else if (includeSrc && FREEZE.isFreezableUrl(includeSrc)) {
                        includes.push({
                            url: _this.pathTo(includeSrc),
                            type: 'src'
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

                if (item.type == 'href' || item.type == 'src') {
                    // freeze images with cssBase.processLink
                    parsed[i] = item.type + '=' + this.child(item.type, item.url).process(baseFile);

                } else {
                    parsed[i] = item.file;
                }
            }

            return parsed.join('');
        }

    })
});
