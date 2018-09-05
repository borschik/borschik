var fs = require('fs');
var inherit = require('inherit');
var sourceMapResolve = require('source-map-resolve');
var SourceMapConsumer = require('source-map').SourceMapConsumer;
var MappingsIterator = require('./mappings-iterator');

function _inherit(d, s) {
    return inherit(this, d, s);
}

var SourceMapRegistry = inherit({
    /**
     * @param {String} options.sourceMapLocation 'inline' or 'file'.
     */
    __constructor: function(options) {
        this.options = options;

        /**
         * @type {Object.<String, Object[]>}
         */
        this.mappings = {};
    },

    /**
     * @param {String} filepath
     * @returns {MappingsIterator|null}
     */
    getMappingsIterator: function(filepath) {
        var mappings = this.mappings;
        var found = mappings[filepath];
        if (found !== undefined) {
            return found;
        }

        var sourceMap = this.getSourceMapForFile(filepath);
        if (sourceMap) {
            var fileMappings = this.getMappingsFromSourceMap(sourceMap);
            if (fileMappings.length) {
                return mappings[filepath] = new MappingsIterator(fileMappings);
            }
        }

        return mappings[filepath] = null;
    },

    getMappingsFromSourceMap: function(sourceMap) {
        var mappings = [];

        sourceMap.eachMapping(function(m) {
            mappings.push(m);
        });

        return mappings;
    },

    getSourceMapForFile: function(filepath) {
        if (this.options.sourceMapLocation === 'file') {
            try {
                var mapContent = fs.readFileSync(filepath + '.map', { encoding: 'utf8' }).toString();

                return new SourceMapConsumer(mapContent);
            } catch(e) {
                if (e.code === 'ENOENT') {
                    return null;
                } else {
                    throw e;
                }
            }
        }

        if (this.options.sourceMapLocation === 'inline') {
            // TODO: reuse raw file contents (ATM available only in Tech#parseInclude)?
            var content = fs.readFileSync(filepath, { encoding: 'utf8' }).toString();
            var resolved = sourceMapResolve.resolveSourceMapSync(content, filepath, fs.readFileSync);

            if (resolved && resolved.map) {
                return new SourceMapConsumer(resolved.map);
            }
        }

        return null;
    }
}, {
    inherit: _inherit
});

module.exports = SourceMapRegistry;
