var CRYPTO = require('crypto'),
    FS = require('fs'),
    PATH = require('path'),
    configs,
    config;

var minimatch = require('minimatch');

if (!PATH.sep) PATH.sep = process.platform === 'win32'? '\\' : '/';

/**
 * Path separator for RegExp
 * @type {string}
 */
var rePathSep = PATH.sep == '\\' ? '\\\\' : PATH.sep;

/**
 * Content type for inlined resources.
 * @constant
 * @type {Object}
 */
const contentTypes = {
    '.gif': 'image/gif',
    '.jpg': 'image/jpeg',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.ttf': 'application/x-font-ttf',
    '.woff': 'application/x-font-woff'
};

/**
 * Clear config cache.
 * This function is usefull for unit-tests.
 */
var clearConfigCache = exports.clearConfigCache = function() {
    config = {
        paths: {},
        freezeNestingLevel: {},
        freezeWildcards: {},
        followSymlinks: {}
    };

    configs = {
        paths: {}
    };
};

clearConfigCache();

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

        if (_freezeDir === ':base64:' || _freezeDir === ':encodeURIComponent:') {
            var fileExtension = PATH.extname(filePath);
            var contentType = contentTypes[fileExtension];
            if (!contentType) {
                throw new Error('Freeze error. Unknown Content-type for ' + fileExtension);
            }

            var inlineDecl = 'data:' + contentType;

            if (_freezeDir === ':base64:') {
                // encode file as base64
                // data:image/svg+xml;base64,....
                return inlineDecl + ';base64,' + new Buffer(content).toString('base64');

            } else {
                // encode file as base64
                // data:image/svg+xml,....
                return inlineDecl + ',' + encodeURIComponent(new Buffer(content).toString('utf8'));
            }

        } else {
            // freeze as file
            var hash = fixBase64(sha1Base64(content));

            var nestingLevel = configFreezeNestingLevel(_freezeDir);
            var nestingPath = getFreezeNestingPath(hash, nestingLevel);

            filePath = PATH.join(_freezeDir, nestingPath + PATH.extname(filePath));

            if (content && !FS.existsSync(filePath)) {
                save(filePath, content);
            }
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

    if (filePath !== realpathSync(filePath)) {
        throw new Error();
    }

    loadConfig(filePath);

    for (var wildcard in config.freezeWildcards) {
        if (minimatch(filePath, wildcard)) {
            return config.freezeWildcards[wildcard];
        }
    }

    return null;
};

/**
 * Returns nesting path.
 * @example
 * getFreezeNestingPath('abc', 1) -> a/bc
 * getFreezeNestingPath('abc', 2) -> a/b/c
 * getFreezeNestingPath('abc', 5) -> a/b/c
 *
 * @param {String} hash Freezed filename.
 * @param {Number} nestingLevel
 * @returns {String}
 */
var getFreezeNestingPath = function(hash, nestingLevel) {
    // reduce nestingLevel to hash size
    nestingLevel = Math.min(hash.length - 1, nestingLevel);

    if (nestingLevel === 0) {
        return hash;
    }

    var hashArr = hash.split('');
    for (var i = 0; i < nestingLevel; i++) {
        hashArr.splice(i * 2 + 1, 0, '/');
    }

    return hashArr.join('');
};

/**
 * Recursivly freeze all files in path.
 * @param {String} input File or directory path
 */
exports.freezeAll = function(input) {
    /**
     * Result JSON
     * @type {Object}
     */
    var result = {};

    var basePath = PATH.dirname(input);
    var stat = FS.statSync(input);
    if (stat.isFile()) {
        freezeAllProcessFile(input, process.cwd(), result);

    } else if (stat.isDirectory()) {
        freezeAllProcessDir(input, basePath, result);
    }

    return result;
};

/**
 * Process file: freeze and write meta-data to result JSON
 * @param absPath
 * @param basePath
 * @param {Object} result Result JSON
 */
function freezeAllProcessFile(absPath, basePath, result) {
    var url = absPath;

    if (freezableRe.test(url) || /\.(?:css|js|swf)$/.test(url)) {
        url = freeze(url);
    }

    var relOriginalPath = PATH.relative(basePath, absPath);
    var resolved = resolveUrl2(url);
    url = (resolved == url ? PATH.relative(basePath, url) : resolved);

    result[relOriginalPath] = url;
}

/**
 * Read dir recursivly and process files
 * @param dir
 * @param basePath
 * @param {Object} result Result JSON
 */
function freezeAllProcessDir(dir, basePath, result) {
    FS.readdirSync(dir).forEach(function(file) {
        file = PATH.resolve(dir, file);
        var stat = FS.statSync(file);
        if (stat.isFile()) {
            freezeAllProcessFile(file, basePath, result);

        } else if (stat.isDirectory()) {
            freezeAllProcessDir(file, basePath, result);
        }
    });
}

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
 * Returns freeze nesting level for given path.
 * @param {String} path Path to search config for.
 * @returns {Number}
 */
var configFreezeNestingLevel = function(path) {
    return config.freezeNestingLevel[path] || 0;
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

    var config_path = PATH.join(path, '.borschik');

    if (FS.existsSync(config_path)) {
        configs.paths[path] = true;
        
        try {
            var _config = JSON.parse(FS.readFileSync(config_path));
        } catch (e) {
            if (e instanceof SyntaxError) {
                console.error('Invalid config: ' + config_path);
            }
            throw e;
        }

        var paths = _config.paths || _config.pathmap || {};
        for (var dir in paths) {
            var realpath = realpathSync(PATH.resolve(path, dir));
            if (!config.paths[realpath]) {
                var value = paths[dir];
                if (value) value = value.replace(/\*/g, PATH.sep);
                config.paths[realpath] = value;
            }
        }

        var freezePaths = _config.freeze_paths || {};
        for (var freezeConfigWildcard in freezePaths) {
            var freezeRealPath = realpathSync(PATH.resolve(path, freezeConfigWildcard));
            if (!config.freezeWildcards[realpath]) {
                var freezeToPath = freezePaths[freezeConfigWildcard];

                // :base64: and :encodeURIComponent: are special syntax for images inlining
                if (freezeToPath !== ':base64:' && freezeToPath !== ':encodeURIComponent:') {
                    freezeToPath = realpathSync(PATH.resolve(path, freezeToPath));

                    // freeze nesting level
                    // 0: all files freeze to given dir
                    // 1: all files freeze to
                    //   freeze-dir/a/bcde.png
                    //   freeze-dir/b/acde.png
                    //   freeze-dir/c/abde.png
                    var _freezeNestingLevel = Math.max(parseInt(_config['freeze_nesting_level'], 10) || 0, 0);
                    if (!config.freezeNestingLevel[freezeToPath]) {
                        config.freezeNestingLevel[freezeToPath] = _freezeNestingLevel;
                    }
                }
                config.freezeWildcards[freezeRealPath] = freezeToPath;
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
        rePrefix = new RegExp('^(' + rePathSep + '[^' + rePathSep + ']+)', 'g'),
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
        hostpath = hostpath.replace(new RegExp('^' + rePathSep + '+'), '');
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
            // fs.mkdirSync('/') raises EISDIR (invalid operation) exception on OSX 10.8.4/node 0.10
            // not tested in other configurations
            if (_path === '/') {
                return;
            }
            // @see https://github.com/veged/borschik/issues/90
            try {
                FS.mkdirSync(_path);
            } catch(e) {
                // ignore EEXIST error
                if (e.code !== 'EEXIST') {
                    throw new Error(e)
                }
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

        var possibleSymlink = PATH.join(prefix, name);

        if (_followSymlinks && isSymLink(possibleSymlink)) {
            /*
             For example, we process file /home/user/www/config/locales/ru.js
             /home/user/www/config is symlink to configs/production

             folders is [ 'home', 'user', 'www', 'config', 'locales', 'ru.js' ]
             */

            // Read symlink. This is relative path (configs/production)
            var relativeLinkPath = FS.readlinkSync(possibleSymlink);

            // Resolve symlink to absolute path (/home/user/www/configs/production)
            var absoluteLinkPath = PATH.resolve(prefix, relativeLinkPath);

            // Split absoulte path into parts
            var linkParts = absoluteLinkPath.split(PATH.sep);

            // now we should replace path /home/user/www/config to /home/user/www/configs/production
            // and save suffix path locales/ru.js
            folders = arraySplice(folders, 0, i + 1, linkParts);

            // result is /home/user/www/configs/production/locales/ru.js
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

exports.getFreezeNestingPath = getFreezeNestingPath;
