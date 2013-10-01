var PATH = require('path');
var VOW = require('vow');
var VOWFS = require('vow-fs');

exports.pathToUnix = function(path) {
    if (PATH.sep === '\\') return path.replace(/\\/g, '/');
    return path;
};

exports.writeFile = function(output, res) {

    return VOW.when(res)
        .then(function(res){

            // save res to file
            if (typeof output === 'string') {
                return VOWFS.write(output, res);
            }

            // write res to writable stream of opened file
            var defer = VOW.promise();

            // output res to stdout
            if (output === process.stdout) {
                output.write(res);
                return defer.fulfill();
            }

            output.on('error', function(err) {
                defer.reject(err);
            });

            output.once('close', function() {
                defer.fulfill();
            });

            output.once('end', function() {
                defer.fulfill();
            });

            output.write(res);
            output.end();

            return defer;

        });

};

exports.stringToBoolean = function(s, def) {
    if (typeof s === 'boolean') return s;
    if (s == 'yes' || s == 'true') return true;
    if (s == 'no' || s == 'false') return false;
    return !!def;
};

/**
 * Check if url processable
 * @description
 * Check whetever url is not absolute: http://example.com, //example.com, /favicon.ico
 * @param {string} url URL to check
 * @returns {boolean}
 */
exports.isLinkProcessable = function(url) {
    return !(~['#', '?', '/'].indexOf(url.charAt(0)) || isAbsoluteUrl(url));
};

function isAbsoluteUrl(url) {
    return /^\w+:/.test(url);
}

function _getTech(tech, use_cwd) {
    if (!tech) {
        return require('./tech');
    }

    // load tech from given path
    // borschik -t ./somepath/tech.js
    if (/^[\/.]/.test(tech)) {
        return require(PATH.resolve(tech));
    }

    // load tech from given path
    try {
        return require('./techs/' + tech);
    } catch(e) {
    }

    // add more node_modules paths
    if (use_cwd) {
        var old_paths = module.paths.slice();
        var parts = PATH.resolve().split(PATH.sep);
        for (var tip = 0, PL = parts.length; tip < PL; tip++) {
            if (parts[tip] === 'node_modules') continue;
            module.paths.unshift(parts.slice(0, tip + 1).concat('node_modules').join(PATH.sep));
        }
    }

    // try to load external tech from npm "borschik-tech-<mytech-name>"
    tech = require('borschik-tech-' + tech);
    if (use_cwd) {
        module.paths = old_paths;
    }
    return tech;
}

exports.getTech = function getTech(tech, use_cwd) {
    tech = _getTech(tech, use_cwd);
    if (!tech.Tech) {
        tech = tech(require('..'));
    }
    return tech;
};
