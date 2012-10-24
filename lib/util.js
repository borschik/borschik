var PATH = require('path');

exports.pathToUnix = function(path) {
    if (PATH.sep === '\\') return path.replace(/\\/g, '/');
    return path;
}
