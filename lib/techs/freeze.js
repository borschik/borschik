/**
 * @fileOverview Borschik tech to freeze files in dir.
 */

var INHERIT = require('inherit');
var base = require('../tech');
var FS = require('../fs');
var PATH = require('path');
var FREEZE = require('../freeze');
var U = require('../util');

const additionalFreezeExtsRe = /\.(?:css|js|swf)$/;

exports.Tech = INHERIT(base.Tech, {

    process: function(path, out) {
        /**
         * Result JSON
         * @type {Object}
         */
        var result = {};

        var basePath = PATH.dirname(path);
        var stat = FS.statSync(path);
        if (stat.isFile()) {
            processFile(path, process.cwd(), result);

        } else if (stat.isDirectory()) {
            readDir(path, basePath, result);
        }

        return U.writeFile(out, this.opts.minimize? JSON.stringify(result) : JSON.stringify(result, null, 4));
    }
});

/**
 * Process file: freeze and write meta-data to result JSON
 * @param absPath
 * @param basePath
 * @param {Object} result Result JSON
 */
function processFile(absPath, basePath, result) {
    var url = absPath;

    if (FREEZE.isFreezableUrl(url) || additionalFreezeExtsRe.test(url)) {
        url = FREEZE.processPath(url);
    }

    var relOriginalPath = PATH.relative(basePath, absPath);
    var resolved = FREEZE.resolveUrl2(url);
    url = (resolved == url ? PATH.relative(basePath, url) : resolved);

    result[relOriginalPath] = url;
}

/**
 * Read dir recursivly and process files
 * @param dir
 * @param basePath
 * @param {Object} result Result JSON
 */
function readDir(dir, basePath, result) {
    FS.readdirSync(dir).forEach(function(file) {
        file = PATH.resolve(dir, file);
        var stat = FS.statSync(file);
        if (stat.isFile()) {
            processFile(file, basePath, result);

        } else if (stat.isDirectory()) {
            readDir(file, basePath, result);
        }
    });
}
