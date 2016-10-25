var FS = require('fs'),
    PATH = require('path'),
    PROCESS = require('process'),
    INHERIT = require('inherit'),
    FREEZE = require('./freeze'),
    md5Hex = require('md5-hex'),
    mkdirp = require('mkdirp');

function _inherit(d, s) {
    return INHERIT(this, d, s);
}

module.exports = INHERIT({
    __constructor: function(tmpDir) {
        this._tmpDir = tmpDir || PATH.join(PROCESS.cwd(), '.borschik_tmp');
        this.parsedContents = {};

        mkdirp.sync(this._tmpDir);
    },

    _buildParsedKey: function(filename) {
        return md5Hex(['parse', filename]);
    },

    _getParsedPath: function(filename) {
        var key = this._buildParsedKey(filename);

        return PATH.join(this._tmpDir, key);
    },

    getParsedContent: function(filename) {
        var content = this.parsedContents[filename];

        if (content) {
            return content;
        }

        var cachePath = this._getParsedPath(filename);

        if (cachePath) {
            try {
                var str = FS.readFileSync(cachePath, { encoding: 'utf-8' });

                return JSON.parse(str);
            } catch (err) { if (err.code !== 'ENOENT') throw err; }
        }
    },

    putParsedContent: function(filename, data) {
        this.parsedContents[filename] = data;

        var cachePath = this._getParsedPath(filename);

        if (cachePath) {
            FS.writeFileSync(cachePath, JSON.stringify(data, null));
        }
    },

    drop: function() {
        this._mtime = Date.now();
    }
}, {
    inherit: _inherit
});
