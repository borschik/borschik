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

exports.isLinkProcessable = function(url) {
    return !(~['#', '?', '/'].indexOf(url.charAt(0)) || isAbsoluteUrl(url));
};

function isAbsoluteUrl(url) {
    return /^\w+:/.test(url);
}
