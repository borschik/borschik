var path = require('path');
var SourceMapGenerator = require('source-map').SourceMapGenerator;
var inherit = require('inherit');

function _inherit(d, s) {
    return inherit(this, d, s);
}

/**
 * Tracks line/column offsets of the file.
 */
function Offset() {
    this.line = 0;
    this.column = 0;
}

var Builder = inherit({
    /**
     * @param {Boolean} [options.generateSourceMap=false]
     * @param {String} [options.sourceMapFilename]
     * @param {String} [options.sourceMapSourceRoot]
     */
    __constructor: function(options) {
        options = options || {};

        this.generateSourceMap = !!options.generateSourceMap;
        this.sourceMapFilename = options.sourceMapFilename;
        this.sourceMapSourceRoot = options.sourceMapSourceRoot;
        this.contentParts = [];

        /**
         * Offsets of the content.
         * @type {Offset}
         */
        this.offset = new Offset();

        /**
         * Offsets of the consumed files.
         * @type {Object.<String, Offset>}
         */
        this.fileOffsets = {};

        this.smg = this.generateSourceMap && new SourceMapGenerator({
            file: this.sourceMapFilename || null,
            sourceRoot: this.sourceMapSourceRoot || null
        });
    },

    /**
     * @param {String} filename File name for source map.
     * @param {BaseNode} node
     * @param {Mappings[]} [mappings]
     * @param {Boolean} [resetFile] Reset tracking of the original offsets for the given file.
     */
    append: function(filename, node, mappings, resetFile) {
        this.contentParts.push(node.getContent());

        if (!this.generateSourceMap) {
            return;
        }

        var lines = node.getLines();
        if (!lines.length) {
            return;
        }

        if (mappings) {
            this._addMappings(mappings);
        } else {
            // Reset offset in order to track multiple includes of the same file correctly.
            var offset = !resetFile && this.fileOffsets[filename];
            if (!offset) {
                offset = this.fileOffsets[filename] = new Offset();
            }

            // If freezeOriginalLine is true, then the original line offsets in the result
            // mappings will be the same for all given lines and will be equal to the
            // previous original line offset.
            var freezeOriginalLine = node.ignoreMappings();
            this._addMappingsForLines(filename, offset, lines, freezeOriginalLine);
            if (!freezeOriginalLine) {
                this._updateOffsets(offset, lines);
            }
        }

        this._updateOffsets(this.offset, lines);
    },

    _addMappings: function(mappings) {
        var smg = this.smg;
        var offset = this.offset;

        mappings.forEach(function(m) {
            smg.addMapping({
                generated: {
                    line: offset.line + m.generatedLine,
                    column: (m.generatedLine === 1 ? offset.column : 0) + m.generatedColumn
                },
                original: m.originalLine && {
                    line: m.originalLine,
                    column: m.originalColumn
                },
                source: m.source,
                name: m.name
            });
        });
    },

    _addMappingsForLines: function(filename, offset, lines, freezeOriginalLine) {
        var smg = this.smg;
        var contentOffset = this.offset;
        var baseOriginalLineOffset = offset.line + (freezeOriginalLine ? 1 : 0);

        for (var i = 1, l = lines.length; i <= l; ++i) {
            // Trailing empty line should be ignored; it will be added when
            // the next node of the file will be appended (if any).
            if (i === l && lines[i - 1] === '') {
                continue;
            }

            smg.addMapping({
                generated: {
                    line: contentOffset.line + i,
                    column: (i === 1 ? contentOffset.column : 0)
                },
                original: {
                    line: baseOriginalLineOffset + (freezeOriginalLine ? 0 : i),
                    column: (i === 1 ? offset.column : 0)
                },
                source: filename
            });
        }
    },

    _updateOffsets: function(offset, lines) {
        var len = lines.length;

        offset.line += len - 1;
        offset.column = (len > 1 ? 0 : offset.column) + lines[len - 1].length;
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
        return this.smg ? this.smg.toString() : null;
    }
}, {
    inherit: _inherit
});

module.exports = Builder;
