var path = require('path');
var inherit = require('inherit');
var Concater = require('./concater');
var SourceMapRegistry = require('./source-map-registry');
var nodes = require('./nodes');

function _inherit(d, s) {
    return inherit(this, d, s);
}

var NodesSerializer = inherit({
    /**
     * @param {BaseNode[]} nodes
     * @param {String|Boolean} [options.inputSourceMap=false] One of the 'file', 'inline', false.
     * @param {String|Boolean} [options.outputSourceMap=false] One of the 'file', 'inline', false.
     * @param {String} [options.outputSourceMapFilename]
     * @param {String} [options.outputSourceMapSourcesPrefix]
     */
    __constructor: function(nodes, options) {
        this.nodes = nodes;

        options = (options || {});
        options.outputSourceMapFilename = options.outputSourceMapFilename || '';
        this.options = options;

        this.concater = new Concater({
            generateSourceMap: !!options.outputSourceMap,
            sourceMapFilename: options.outputSourceMapFilename,
            sourceMapSourcesPrefix: options.outputSourceMapSourcesPrefix
        });

        if (options.outputSourceMap) {
            this.sourceMapRegistry = new SourceMapRegistry({
                sourceMapLocation: options.inputSourceMap
            });
        }

        /**
         * @type {String[]}
         */
        this.passedDirectives = [];
    },

    /**
     * @returns {Concater}
     */
    serialize: function() {
        var self = this;
        var options = this.options;
        var sourceMapRoot = options.outputSourceMapRoot || path.dirname(options.outputSourceMapFilename);
        var concater = this.concater;
        var inputSourceMap = options.outputSourceMap && options.inputSourceMap;

        this.nodes.forEach(function addToConcater(node) {
            if (node instanceof nodes.IncludeNode) {
                node.eachChild(addToConcater);
            } else {
                var mappings = inputSourceMap ? self.getMappingsForNode(node) : null;

                concater.concat(path.relative(sourceMapRoot, node.path), node, mappings);
            }

            if (node.directive) {
                // Mark the directive as passed in order to correct offsets
                // of the source mappings for the following node.
                self.passedDirectives.push(node.directive);
            }
        });

        return concater;
    },

    /**
     * @param {BaseNode} node
     * @returns {Mapping[]}
     */
    getMappingsForNode: function(node) {
        // Always extract passed directive, since the presence of the source map
        // is not guaranteed for all source files.
        var passedDirective = this.passedDirectives.pop();

        var mappingsIterator = this.sourceMapRegistry.getMappingsIterator(node.path);
        if (!mappingsIterator) {
            return null;
        }

        var lines = node.getLines();
        var linesCount = lines.length;
        // Lines are 1-based.
        var firstLine = mappingsIterator.lastLine;
        var lastLine = firstLine + linesCount - 1;
        // First column starts after borschik's directives, if any.
        var firstColumn = mappingsIterator.lastColumn + (passedDirective ? passedDirective.length : 0);
        // One-liners should add the start offset to the end offset. -1 since columns are 0-based;
        var lastColumn = (linesCount === 1 ? firstColumn : 0) + lines[linesCount - 1].length - 1;

        mappingsIterator.readWhile(function(m) {
            return m.generatedLine === firstLine && m.generatedColumn < firstColumn;
        });
        var mappings = mappingsIterator.readWhile(function(m) {
            return m.generatedLine < lastLine || m.generatedLine === lastLine && m.generatedColumn <= lastColumn;
        });

        // Correct mappings – treat every node as a separate file,
        // so mappings should starts from the [1, 0] (line, column).
        mappings.forEach(function(m) {
            m.generatedColumn = m.generatedColumn - (m.generatedLine === firstLine ? firstColumn : 0);
            m.generatedLine = m.generatedLine - (firstLine - 1);
        });

        mappingsIterator.lastLine = lastLine;
        mappingsIterator.lastColumn = node instanceof nodes.LinkURLNode ? firstColumn : (lastColumn + 1);

        return mappings;
    },
}, {
    inherit: _inherit
});

module.exports = NodesSerializer;
