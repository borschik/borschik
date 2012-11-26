var PATH = require('path'),
    Q = require('q'),
    QFS = require('q-fs');

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

}
