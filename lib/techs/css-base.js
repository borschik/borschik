var PATH = require('path');

var freeze = require('../freeze');
var base = require('../tech');

/**
 * RegExp to check if url is inlined content.
 * Checks for
 * data:image/gif;base64,
 * data:image/gif,
 * @type {RegExp}
 */
const RE_INLINED_CONTENT = /^data:\w+\/[-+\w;]+,/;

exports.Tech = base.Tech.inherit({
    minimize: function(content) {
        return require('csso').minify(content).css;
    },

    File: exports.File = base.File.inherit({
        processLink: function(path) {
            var url = this.path;

            var queryPostfix = '';
            var hashPostfix = '';

            // filter.svg?foo=bar
            // filter.svg#filterId
            // filter.svg?foo=bar#filterId
            var queryIndex = url.indexOf('?');
            if (queryIndex > -1) {
                queryPostfix = url.substring(queryIndex);
                url = url.substring(0, queryIndex);
            }

            var hashIndex =  url.indexOf('#');
            if (hashIndex > -1) {
                hashPostfix = url.substring(hashIndex);
                url = url.substring(0, hashIndex);
            }

            if (this.tech.opts.freeze && this.isFreezableUrl(url)) {
                try {
                    url = freeze.processPath(url);
                } catch(e) {
                    // Find all parents for better error message
                    var message = [e.message];
                    var parentFile = this.parent;
                    while (parentFile && parentFile.path) {
                        message.push('  -> ' + parentFile.path);
                        parentFile = parentFile.parent;
                    }
                    throw new Error(message.join('\n'));
                }
            }

            // if url isn't inlined
            if (!RE_INLINED_CONTENT.test(url)) {
                var resolved = freeze.resolveUrl2(url);

                if (resolved == url) {
                    url = PATH.relative(PATH.dirname(path), url);

                } else {
                    url = resolved;
                }

                // adds GET parameters
                url += queryPostfix;
            }

            url += hashPostfix;

            return JSON.stringify(url).replace(/\\\\/g, '/');
        },

        isFreezableUrl: function(url) {
            return freeze.isFreezableUrl(url);
        }
    })
});
