var PATH = require('path'),
    Q = require('q'),
    QFS = require('q-io/fs');

exports.pathToUnix = function(path) {
    if (PATH.sep === '\\') return path.replace(/\\/g, '/');
    return path;
};

exports.writeFile = function(output, res) {

    return Q.when(res)
        .then(function(res){

            // save res to file
            if (typeof output === 'string') {
                return QFS.write(output, res);
            }

            // output res to stdout
            if (output === process.stdout) {
                output.write(res);
                return Q.resolve();
            }

            // write res to writable stream of opened file
            var defer = Q.defer();

            output.on('error', function(err) {
                defer.reject(err);
            });

            output.once('close', function() {
                defer.resolve();
            });

            output.once('end', function() {
                defer.resolve();
            });

            output.write(res);
            output.end();

            return defer.promise;

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
