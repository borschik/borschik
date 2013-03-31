/**
 * @fileOverview Borschik tech to freeze files in dir.
 */

process.env.BORSCHIK_FREEZABLE_EXTS = 'jpg jpeg gif ico png swf svg ttf eot otf woff css js swf';

var INHERIT = require('inherit');
var base = require('../tech');
var FS = require('../fs');
var PATH = require('path');
var FREEZE = require('../freeze');
var U = require('../util');

/**
 * Result JSON
 * @type {Object}
 */
var result = {};

exports.Tech = INHERIT(base.Tech, {

    process: function(path, out) {
        var basePath = PATH.dirname(path);
        var stat = FS.statSync(path);
        if (stat.isFile()) {
            processFile(path, process.cwd());

        } else if (stat.isDirectory()) {
            readDir(path, basePath);
        }

        return U.writeFile(out, this.opts.minimize? JSON.stringify(result) : JSON.stringify(result, null, 4));
    }
});

/**
 * Process file: freeze and write meta-data to result JSON
 * @param absPath
 * @param basePath
 */
function processFile(absPath, basePath) {
    var url = absPath;

    if (FREEZE.isFreezableUrl(url)) {
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
 */
function readDir(dir, basePath) {
    FS.readdirSync(dir).forEach(function(file) {
        file = PATH.resolve(dir, file);
        var stat = FS.statSync(file);
        if (stat.isFile()) {
            processFile(file, basePath);

        } else if (stat.isDirectory()) {
            readDir(file, basePath);
        }
    });
}
