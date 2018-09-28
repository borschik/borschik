var inherit = require('inherit');

function _inherit(d, s) {
    return inherit(this, d, s);
}

var MappingsIterator = inherit({
    /**
     * @typedef {Object} Mapping Source mapping object.
     */
     /**
     * @param {Mapping[]} mappings
     */
    __constructor: function(mappings) {
        this.mappings = mappings;
        this.position = 0;
        this.lastLine = 1;
        this.lastColumn = 0;
    },

    /**
     * @callback whileCallback
     * @param {Mapping} mapping
     * @return {Boolean}
     */
    /**
     * @param {whileCallback} fn
     */
    skipWhile: function(fn) {
        var mappings = this.mappings;
        var len = mappings.length;

        while (this.position < len) {
            var mapping = mappings[this.position];
            if (!fn(mapping)) {
                break;
            }
            ++this.position;
        }
    },

    /**
     * @param {whileCallback} fn
     * @returns {Mapping[]}
     */
    readWhile: function(fn) {
        var mappings = this.mappings;
        var len = mappings.length;
        var read = [];

        while (this.position < len) {
            var mapping = mappings[this.position];
            if (!fn(mapping)) {
                break;
            }
            read.push(mapping);
            ++this.position;
        }

        return read;
    },

    /**
     * @callback eachMappingCallback
     * @param {Mapping} mapping
     */
     /**
     * @param {eachMappingCallback} fn
     */
    eachMapping: function(fn) {
        var mappings = this.mappings;
        var len = mappings.length;

        while (this.position < len) {
            fn(mappings[this.position]);
            ++this.position;
        }
    },

    /**
     * @returns {Mapping}
     */
    current: function() {
        return this.mappings[this.position];
    }
}, {
    inherit: _inherit
});

module.exports = MappingsIterator;
