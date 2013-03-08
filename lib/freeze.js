var CRYPTO = require('crypto'),
    FS = require('./fs'),
    PATH = require('path'),
    configs = {
        paths: {}
    },
    config = {
        paths: {},
        freezePaths: {},
        followSymlinks: {}
    };

if (!PATH.sep) PATH.sep = process.platform === 'win32'? '\\' : '/';

/**
 * Process image.
 *
 * @param {String} filePath Path to image file to process.
 * @returns {String} New path of processed image.
 */
exports.processPath = function(filePath) {
    return freeze(realpathSync(filePath));
};

/**
 * Code content by SHA1 Base64 algorithm.
 *
 * @param {String} content Content to code.
 * @returns {String} Coded content.
 */
var sha1Base64 = exports.sha1Base64 = function(content) {
    var sha1 = CRYPTO.createHash('sha1');
    sha1.update(content);
    return sha1.digest('base64');
};

/**
 * Fix Base64 string to accomplish Borschik needs.
 *
 * @param {String} base64 String to fix.
 * @returns {String} Fixed string.
 */
var fixBase64 = exports.fixBase64 = function(base64) {
    return base64
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '')
        .replace(/^[+-]+/g, '');
};

/**
 * Freeze image.
 *
 * @param {String} filePath Path to the image to freeze.
 * @param {String} content Optional content to use.
 * @returns {String} Path to the frozen image.
 */
var freeze = exports.freeze = function(filePath, content) {
    if (filePath !== realpathSync(filePath)) throw new Error();

    var _freezeDir = freezeDir(filePath);

    if (_freezeDir) {
        if (content === undefined) {
            if (!FS.existsSync(filePath)) throw new Error("No such file or directory: " + filePath);
            if (FS.statSync(filePath).isDirectory()) throw new Error("Is a directory (file needed): " + filePath);

            content = FS.readFileSync(filePath);
        }

        var hash = fixBase64(sha1Base64(content));
        filePath = PATH.join(_freezeDir, hash + PATH.extname(filePath));

        if (content && !FS.existsSync(filePath)) {
            save(filePath, content);
        }
    }

    return filePath;
};

/**
 * Get freeze dir for specific file path.
 *
 * @param {String} filePath File path to use.
 * @returns {String} Freeze dir.
 */
var freezeDir = exports.freezeDir = function(filePath) {
    filePath = PATH.normalize(filePath);

    if (filePath !== realpathSync(filePath)) throw Error();

    var suffix = filePath,
        prefix = '',
        freezeDir,
        rePrefix = new RegExp('^(' + PATH.sep + '*[^' + PATH.sep +']+)', 'g'),
        matched;

    while (matched = filePath.match(rePrefix)) {
        prefix += matched[0];
        freezeDir = freezePath(prefix) || freezeDir;
        filePath = filePath.replace(rePrefix, '');
    }

    return freezeDir;
};

/**
 * Get path from "path" config by path if any.
 *
 * @param {String} _path Path to search config for.
 * @returns {String} Path.
 */
var path = exports.path = function(_path) {
    loadConfig(_path);
    return config.paths[_path];
};

/**
 * Get path from "freeze path" config by path if any.
 *
 * @param {String} path Path to search config for.
 * @returns {String} Path.
 */
var freezePath = exports.freezePath = function(path) {
    loadConfig(path);
    return config.freezePaths[path];
};

/**
 * Get path from "follow symlinks" config by path if any.
 *
 * @param {String} path Path to search config for.
 * @returns {String} Path.
 */
var followSymlinks = exports.followSymlinks = function(path) {
    loadConfig(path);
    return config.followSymlinks[path];
};

/**
 * Load config from path.
 *
 * @param {String} path Path to load from.
 */
var loadConfig = exports.loadConfig = function(path) {
    if (configs.paths[path] !== undefined) return;

    if (FS.existsSync(PATH.join(path, '.borschik'))) {
        configs.paths[path] = true;
        
        var _config = JSON.parse(FS.readFileSync(PATH.join(path, '.borschik')));

        var paths = _config.paths || _config.pathmap || {};
        for (var dir in paths) {
            var realpath = realpathSync(PATH.resolve(path, dir));
            if (!config.paths[realpath]) {
                var value = paths[dir];
                if (value) value = value.replace(/\*/g, PATH.sep);
                config.paths[realpath] = value;
            }
        }

        var freezePaths = _config.freeze_paths || _config.hashsum_paths || {};
        for (var dir in freezePaths) {
            var realpath = realpathSync(PATH.resolve(path, dir));
            if (!config.freezePaths[realpath]) {
                var value = freezePaths[dir];
                value = realpathSync(PATH.resolve(PATH.resolve(path, dir), value));
                if (value) value = value.replace(/\*/g, PATH.sep);
                config.freezePaths[realpath] = value;
            }
        }

        var _followSymlinks = _config.follow_symlinks || {};
        for (var dir in _followSymlinks) {
            var realpath = realpathSync(PATH.resolve(path, dir));
            if (!config.followSymlinks[realpath]) {
                config.followSymlinks[realpath] = _followSymlinks[dir];
            }
        }
    } else {
        configs.paths[path] = false;
    }

};

/**
 * Resolve URL.
 *
 * @param {String} filePath File path to resolve.
 * @param {String} base Base to use if any.
 * @returns {String} Resolved URL.
 */
var resolveUrl2 = exports.resolveUrl2 = function(filePath, base) {
    filePath = realpathSync(filePath);

    var suffix = filePath,
        prefix = '',
        host = '',
        hostpath = '',
        rePrefix = new RegExp('^(' + PATH.sep + '[^' + PATH.sep + ']+)', 'g'),
        matched;

    while (matched = suffix.match(rePrefix)) {
        prefix += matched[0];
        hostpath += matched[0];

        var _path = path(prefix);
        if (_path !== undefined) {
           host = _path;
           hostpath = '';
        }
        suffix = suffix.replace(rePrefix, '');
    }

    var result;

    if (host) {
        hostpath = hostpath.replace(new RegExp('^' + PATH.sep + '+'), '');
        result = host + hostpath + suffix;
    } else {
        result = PATH.resolve(base, prefix + suffix);
    }

    return result;
};

/**
 * Make dirs if not exists.
 *
 * @param {String} path Path to make.
 */
function mkpath(path) {
    var dirs = path.split(PATH.sep),
        _path = '';

    dirs.forEach(function(dir) {
        dir = dir || PATH.sep;
        if (dir) {
            _path = PATH.join(_path, dir);
            if (!FS.existsSync(_path)) {
                FS.mkdirSync(_path);
            }
        }
    });
}

/**
 * Save file and make dirs if needed.
 *
 * @param {String} filePath File path to save.
 * @param {String} content File content to save.
 */
function save(filePath, content) {
    mkpath(PATH.dirname(filePath));
    FS.writeFileSync(filePath, content);
}

/**
 * Expands all symbolic links (if "follow symlinks" config "true") and resolves references.
 *
 * @param {String} path Path to make real.
 * @param {String} base Base to use.
 * @returns {String} Real file path.
 */
var realpathSync = exports.realpathSync = function(path, base) {
    path = PATH.resolve(base? base : process.cwd(), path);

    var folders = path.split(PATH.sep);

    for (var i = 0; i < folders.length; ) {
        var name = folders[i];

        if (name === '') {
            i++;
            continue;
        }

        var prefix = subArrayJoin(folders, PATH.sep, 0, i - 1),
            _followSymlinks = false;

        for (var j = 0; j < i; j++) {
            var followSymlinksJ = followSymlinks(subArrayJoin(folders, PATH.sep, 0, j));
            if (followSymlinksJ !== undefined) _followSymlinks = followSymlinksJ;
        }

        if (_followSymlinks && isSymLink(PATH.join(prefix, name))) {
            var linkParts = FS.readlinkSync(PATH.join(prefix, name)).split(PATH.sep);
            folders = arraySplice(folders, 0, i + 1, linkParts);
        } else {
            i++;
        }
    }

    return folders.join(PATH.sep);
};

// Freezable test extensions
var freezableExts = (process.env.BORSCHIK_FREEZABLE_EXTS ||
        'jpg jpeg gif ico png swf svg ttf eot otf woff').split(' '),
    freezableRe = new RegExp('\\.(' + freezableExts.join('|') + ')$');

/**
 * Check if URL is freezable.
 *
 * @param {String} url URL to check.
 * @returns {boolean} True if URL is freezable, otherwise false.
 */
exports.isFreezableUrl = function(url) {
    return freezableRe.test(url);
};

/**
 * Join part of array.
 *
 * @param {Array} a Array to join.
 * @param {String} separator Separator to use in join.
 * @param {Number} from Join start index.
 * @param {Number} to Join finish index.
 * @returns {String} Joined array string.
 */
function subArrayJoin(a, separator, from, to) {
    return a.slice(from, to + 1).join(separator);
}

/**
 * Splice array replacing it's elements by another array.
 *
 * @param {Array} a1 Array to splice.
 * @param {Number} from Splice start index.
 * @param {Number} to Splice finish index.
 * @param {Array} a2 Array to inject.
 * @returns {Array} New array.
 */
function arraySplice(a1, from, to, a2) {
    var aL = a1.slice(0, from),
        aR = a1.slice(to);

    return aL.concat(a2).concat(aR);
}

/**
 * Check if path is the path to symbolic link.
 *
 * @param {String} path Path to check.
 * @returns {boolean} True if it is symbolic link, otherwise false.
 */
function isSymLink(path) {
    return FS.existsSync(path) && FS.lstatSync(path).isSymbolicLink();
}
