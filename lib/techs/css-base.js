var INHERIT = require('inherit'),
    FREEZE = require('../freeze'),
    base = require('../tech'),
    PATH = require('path'),
    CSSO = require('csso');

/**
 * RegExp to check if url is inlined content.
 * Checks for data:image/gif;
 * @type {RegExp}
 */
const RE_INLINED_CONTENT = /^data:\w+\/[-+\w]+;/;

exports.Tech = INHERIT(base.Tech, {

    minimize: function(content) {
        return CSSO.justDoIt(content);
    },

    File: exports.File = INHERIT(base.File, {

        processLink: function(path) {
            var url = this.path,
                i = url.indexOf('?'),
                postUrl = '';

            if (i > -1) {
                postUrl = url.substring(i);
                url = url.substring(0, i);
            }

            if (this.tech.opts.freeze && this.isFreezableUrl(url)) {
                url = FREEZE.processPath(url);
            }

            // if url isn't inlined
            if (!RE_INLINED_CONTENT.test(url)) {
                var resolved = FREEZE.resolveUrl2(url);

                if (resolved == url) {
                    url = PATH.relative(PATH.dirname(path), url);

                } else {
                    url = resolved;
                }

                // adds GET parameters
                url += postUrl;
            }

            return JSON.stringify(url).replace(/\\\\/g, '/');
        },

        isFreezableUrl: function(url) {
            return FREEZE.isFreezableUrl(url);
        }

    })

});
