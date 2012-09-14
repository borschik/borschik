var PATH = require('path'),
    FS = require('fs');
for (var k in FS) exports[k] = FS[k];

exports.exists || (exports.exists = PATH.exists);
exports.existsSync || (exports.existsSync = PATH.existsSync);
