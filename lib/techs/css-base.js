var INHERIT = require('inherit'),
    FREEZE = require('../freeze'),
    util = require('util'),
    base = require('../tech'),
    PATH = require('path'),
    CSSO = require('csso');

exports.Tech = INHERIT(base.Tech, {

    minimize: function(content) {
        return CSSO.justDoIt(content);
    },

    File: exports.File = INHERIT(base.File, {

        processLink: function(path) {
            if (this.tech.opts.freeze == 'no') return this.path;

            var url = this.path,
                i = url.indexOf('?'),
                postUrl = '';

            if (i > 0) {
                postUrl = url.substring(i);
                url = url.substring(0, i);
            }

            if (FREEZE.isImageUrl(url)) {
                var frozen = FREEZE.processImage(url),
                    resolved = FREEZE.resolveUrl2(frozen, '');

                url = (frozen == resolved? PATH.relative(PATH.dirname(path), resolved) : resolved) + postUrl;
            } else {
                url = this.pathFrom(path);
            }

            return JSON.stringify(url);
        }

    })
});
