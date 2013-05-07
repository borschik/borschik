var INHERIT = require('inherit'),
    FREEZE = require('../freeze'),
    base = require('../tech'),
    PATH = require('path'),
    CSSO = require('csso');

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

            var resolved = FREEZE.resolveUrl2(url);

            url = (resolved == url ? PATH.relative(PATH.dirname(path), url) : resolved) + postUrl;

            return JSON.stringify(url).replace(/\\\\/g, '/');
        },

        isFreezableUrl: function(url) {
            return FREEZE.isFreezableUrl(url);
        }

    })

});
