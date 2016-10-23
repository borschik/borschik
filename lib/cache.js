var FS = require('fs'),
    PATH = require('path'),
    FREEZE = require('./freeze'),
    INHERIT = require('inherit'),
    U = require('./util'),
    VOW = require('vow');

function _inherit(d, s) {
    return INHERIT(this, d, s);
}

module.exports = INHERIT({
    __constructor: function(opts) {
        this.processedContents = {};
    },

    _buildKey: function(filename, data) {
        return filename + ':' + JSON.stringify(data);
    },

    getProcessedContent: function(filename, data) {
        var key = this._buildKey(filename, data);

        return this.processedContents[key];
    },

    setProcessedContent: function(filename, contents, data) {
        var key = this._buildKey(filename, data);

        this.processedContents[key] = contents;
    },
}, {
    inherit: _inherit
});
