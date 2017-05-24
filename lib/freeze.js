var fs = require('fs');
var PATH = require('path');

var borschikHash = require('borschik-hash');

var configs;
var config;

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
    '.css': 'text/css',
    '.cur': 'image/x-icon',
    '.eot': 'application/vnd.ms-fontobject',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.js': 'application/javascript',
    // '.json': 'application/json',
    '.otf': 'font/opentype',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.swf': 'application/x-shockwave-flash',
    '.ttf': 'application/x-font-ttf',
    '.woff': 'application/x-font-woff',
    '.woff2': 'application/font-woff2'
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
            if (!fs.existsSync(filePath)) throw new Error("No such file or directory: " + filePath);
            if (fs.statSync(filePath).isDirectory()) throw new Error("Is a directory (file needed): " + filePath);

            content = fs.readFileSync(filePath);
        }

        if (_freezeDir === ':base64:' || _freezeDir === ':encodeURIComponent:' || _freezeDir === ':encodeURI:') {
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
                // encode file as encoded url
                // data:image/svg+xml,....
                var encodeFunc = _freezeDir === ':encodeURI:' ? encodeURI : encodeURIComponent;
                return inlineDecl + ',' + encodeFunc(new Buffer(content).toString('utf8'))
                    .replace(/%20/g, ' ')
                    .replace(/#/g, '%23');
            }

        } else {
            // freeze as file
            var hash = borschikHash(content);

            var nestingLevel = configFreezeNestingLevel(_freezeDir);
            var nestingPath = getFreezeNestingPath(hash, nestingLevel);

            filePath = PATH.join(_freezeDir, nestingPath + PATH.extname(filePath));

            if (content && !fs.existsSync(filePath)) {
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
    var stat = fs.statSync(input);
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
    fs.readdirSync(dir).forEach(function(file) {
        file = PATH.resolve(dir, file);
        var stat = fs.statSync(file);
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

    if (fs.existsSync(config_path)) {
        configs.paths[path] = true;

        try {
            var _config = JSON.parse(fs.readFileSync(config_path));
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

        var freezeNestingLevels = _config['freeze_nesting_levels'] || {};
        for (var dir in freezeNestingLevels) {
            var realpath = realpathSync(PATH.resolve(path, dir));
            setNestingLevel(config.freezeNestingLevel, realpath, freezeNestingLevels[dir]);
        }

        var freezePaths = _config.freeze_paths || {};
        for (var freezeConfigWildcard in freezePaths) {
            var freezeRealPath = realpathSync(PATH.resolve(path, freezeConfigWildcard));
            if (!config.freezeWildcards[realpath]) {
                var freezeToPath = freezePaths[freezeConfigWildcard];

                // :base64: and :encodeURIComponent: are special syntax for images inlining
                if (freezeToPath !== ':base64:' && freezeToPath !== ':encodeURIComponent:' && freezeToPath !== ':encodeURI:') {
                    freezeToPath = realpathSync(PATH.resolve(path, freezeToPath));

                    // freeze nesting level
                    // 0: all files freeze to given dir
                    // 1: all files freeze to
                    //   freeze-dir/a/bcde.png
                    //   freeze-dir/b/acde.png
                    //   freeze-dir/c/abde.png
                    setNestingLevel(config.freezeNestingLevel, freezeToPath, _config['freeze_nesting_level']);
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

    var suffix = filePath;
    var prefix = '';
    var host = '';
    var hostpath = '';
    var rePrefix = new RegExp('^(' + rePathSep + '[^' + rePathSep + ']+)', 'g');
    var matched;

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
    var dirs = path.split(PATH.sep);
    var _path = '';
    var winDisk = /^\w{1}:\\$/;

    dirs.forEach(function(dir) {
        dir = dir || PATH.sep;
        if (dir) {
            _path = _path ? PATH.join(_path, dir) : dir;
            // fs.mkdirSync('/') raises EISDIR (invalid operation) exception on OSX 10.8.4/node 0.10
            // fs.mkdirSync('D:\\') raises EPERM (operation not permitted) exception on Windows 7/node 0.10
            // not tested in other configurations
            if (_path === '/' || winDisk.test(PATH.resolve(dir))) {
                return;
            }
            // @see https://github.com/veged/borschik/issues/90
            try {
                fs.mkdirSync(_path);
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
    fs.writeFileSync(filePath, content);
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

        var prefix = subArrayJoin(folders, PATH.sep, 0, i - 1);
        var _followSymlinks = false;

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
            var relativeLinkPath = fs.readlinkSync(possibleSymlink);

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
var freezableExts = process.env.BORSCHIK_FREEZABLE_EXTS ? process.env.BORSCHIK_FREEZABLE_EXTS.split(' ') :
    Object.keys(contentTypes).map(function(ext) {
        return ext.slice(1);
    });
var freezableRe = new RegExp('\\.(' + freezableExts.join('|') + ')$');

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
    var aL = a1.slice(0, from);
    var aR = a1.slice(to);

    return aL.concat(a2).concat(aR);
}

/**
 * Check if path is the path to symbolic link.
 *
 * @param {String} path Path to check.
 * @returns {boolean} True if it is symbolic link, otherwise false.
 */
function isSymLink(path) {
    return fs.existsSync(path) && fs.lstatSync(path).isSymbolicLink();
}

/**
 * Parse and set nesting level in config object
 * @param {object} config Nesting level config
 * @param {string} dir Path to directory
 * @param {string} rawValue Raw value from config (.borschik)
 */
function setNestingLevel(config, dir, rawValue) {
    // config can have value "0", so we can't use "!config[dir]"
    if ( !(dir in config) ) {
        config[dir] = Math.max(parseInt(rawValue, 10) || 0, 0);
    }
}

exports.getFreezeNestingPath = getFreezeNestingPath;
