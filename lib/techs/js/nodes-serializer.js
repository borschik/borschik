var path = require('path');
var Builder = require('./builder');
var SourceMapRegistry = require('./source-map-registry');
var nodes = require('./nodes');

class NodesSerializer{
    /**
     * @param {BaseNode[]} nodes
     * @param {String|Boolean} [options.inputSourceMap=false] One of the 'file', 'inline', false.
     * @param {String|Boolean} [options.sourceMap=false] One of the 'file', 'inline', false.
     * @param {String} [options.sourceMapRoot] Relative root for sources (i.e. all source paths will be relative to this path).
     * @param {String} [options.sourceMapFilename] `file` property of the resulting source map.
     * @param {String} [options.sourceMapSourceRoot] `sourceRoot` property of the resulting source map.
     */
    constructor(nodes, options) {
        this.nodes = nodes;

        options = (options || {});
        options.sourceMapFilename = options.sourceMapFilename || '';
        options.sourceMapRoot = options.sourceMapRoot || path.dirname(options.sourceMapFilename);
        this.options = options;

        this.builder = new Builder({
            generateSourceMap: !!options.sourceMap,
            sourceMapFilename: options.sourceMapFilename,
            sourceMapSourceRoot: options.sourceMapSourceRoot
        });

        if (options.sourceMap) {
            this.sourceMapRegistry = new SourceMapRegistry({
                sourceMapLocation: options.inputSourceMap
            });
        }

        /**
         * @type {String[]}
         */
        this.passedDirectives = [];
    }

    /**
     * @returns {Builder}
     */
    serialize() {
        var self = this;
        var options = this.options;
        var builder = this.builder;
        var inputSourceMap = options.sourceMap && options.inputSourceMap;

        this.nodes.forEach(function append(node, i) {
            if (node.hasChildren()) {
                node.eachChild(append);
            } else {
                var resetFile = i === 0;
                var mappings = inputSourceMap ? self.getMappingsForNode(node) : null;

                builder.append(path.relative(options.sourceMapRoot, node.path), node, mappings, resetFile);
            }

            if (node.directive) {
                // Mark the directive as passed in order to correct offsets
                // of the source mappings for the following node.
                self.passedDirectives.push(node.directive);
            }
        });

        return builder;
    }

    /**
     * @param {BaseNode} node
     * @returns {Mapping[]}
     */
    getMappingsForNode(node) {
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
        // First column starts after borschik's directive.
        var firstColumn = mappingsIterator.lastColumn + (passedDirective ? passedDirective.length : 0);
        // One-liners should add the start offset to the end offset. -1 since columns are 0-based;
        var lastColumn = (linesCount === 1 ? firstColumn : 0) + lines[linesCount - 1].length - 1;

        mappingsIterator.skipWhile(function(m) {
            return m.generatedLine === firstLine && m.generatedColumn < firstColumn;
        });
        var mappings = mappingsIterator.readWhile(function(m) {
            return m.generatedLine < lastLine || m.generatedLine === lastLine && m.generatedColumn <= lastColumn;
        });

        // Correct offsets.
        mappings.forEach(function(m) {
            m.generatedColumn = m.generatedColumn - (m.generatedLine === firstLine ? firstColumn : 0);
            m.generatedLine = m.generatedLine - (firstLine - 1);
        });

        mappingsIterator.lastLine = lastLine;
        mappingsIterator.lastColumn = node.ignoreMappings() ? firstColumn : (lastColumn + 1);

        return mappings;
    }
}

module.exports = NodesSerializer;
