var path = require('path');
var SourceMapGenerator = require('source-map').SourceMapGenerator;
var inherit = require('inherit');

function _inherit(d, s) {
    return inherit(this, d, s);
}

var Concater = inherit({
    /**
     * @param {Boolean} [options.generateSourceMap=false]
     * @param {String} [options.sourceMapFilename]
     * @param {String} [options.sourceMapSourcesPrefix]
     */
    __constructor: function(options) {
        options = options || {};

        this.generateSourceMap = !!options.generateSourceMap;
        this.sourceMapFilename = options.sourceMapFilename || '';
        this.sourceMapSourcesPrefix = options.sourceMapSourcesPrefix || '';
        this.contentParts = [];
        this.lineOffset = 0;
        this.columnOffset = 0;

        if (this.generateSourceMap) {
            this.sourceMap = new SourceMapGenerator({ file: this.sourceMapFilename });
        }
    },

    /**
     * @param {String} filename File name for source map.
     * @param {BaseNode} node
     * @param {Mappings[]} [mappings]
     */
    concat: function(filename, node, mappings) {
        this.contentParts.push(node.getContent());

        if (!this.generateSourceMap) {
            return;
        }

        var self = this;
        var lines = node.getLines();
        var linesCount = lines.length;

        if (mappings) {
            mappings.forEach(function(m) {
                self.sourceMap.addMapping({
                    generated: {
                        line: self.lineOffset + m.generatedLine,
                        column: (m.generatedLine === 1 ? self.columnOffset : 0) + m.generatedColumn
                    },
                    original: m.originalLine && {
                        line: m.originalLine,
                        column: m.originalColumn
                    },
                    source: path.join(self.sourceMapSourcesPrefix, m.source),
                    name: m.name
                });
            });
        } else {
            for (var i = 1; i <= linesCount; ++i) {
                self.sourceMap.addMapping({
                    generated: {
                        line: self.lineOffset + i,
                        column: (i === 1 ? self.columnOffset : 0)
                    },
                    original: {
                        line: i,
                        column: 0
                    },
                    source: path.join(self.sourceMapSourcesPrefix, filename)
                });
            }
        }

        this.lineOffset += linesCount - 1;
        if (linesCount > 1) {
            this.columnOffset = 0;
        }
        this.columnOffset += lines[linesCount - 1].length;
    },

    /**
     * @returns {String}
     */
    getContent: function() {
        return this.contentParts.join('');
    },

    /**
     * @returns {String|null}
     */
    getSourceMap: function() {
        return this.sourceMap ? this.sourceMap.toString() : null;
    }
}, {
    inherit: _inherit
});

module.exports = Concater;
