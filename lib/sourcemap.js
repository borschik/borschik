var PATH = require('path'),
    INHERIT = require('inherit'),
    SOURCEMAP = require('source-map');

exports.SourceMap = INHERIT({

    __constructor: function(file) {
        this.file = file;
        this.sources = {};
        this.mapping = [];

        this.generator = null;
    },

    createSource: function(name, content) {
        var file = this.sources[name];
        if (!file) {
            file = this.sources[name] = {};
        }

        if (content) {
            if (Buffer.isBuffer(content)) {
                content = content.toString('utf-8');
            }
            file.content = content;
        }

        return file;
    },

    eachMapping: function(fn, ctx) {
        this.mapping.forEach(function(mapping, i) {
            fn.call(ctx || this, mapping, i, this.sources[mapping.source]);
        }, this);
    },

    addMapping: function(source, genline, gencolumn, origline, origcolumn, chunk) {
        // FIXME: magic!
        chunk = chunk.replace(/\n$/, '');
        chunk.split('\n').forEach(function(chunk, line) {
            if (chunk.length) {
                this.mapping.push({
                    source: source,
                    generatedLine: genline + line,
                    generatedColumn: gencolumn,
                    originalLine: origline + line,
                    originalColumn: origcolumn,
                    chunk: chunk
                });
            }
            gencolumn = 0;
            origcolumn = 0;
        }, this);
    },

    combine: function(map, offset, isJsonStringified) {
        var offsetLine = offset.line || 0,
            offsetColumn = offset.column || 0,
            newLine, newColumn;

        newLine = map.mapping[0].generatedLine + offsetLine;
        newColumn = map.mapping[0].generatedColumn + offsetColumn;

        map.mapping.forEach(function(mapping, i) {
            this.addMapping(
                mapping.source,
                newLine,
                newColumn,
                mapping.originalLine,
                mapping.originalColumn,
                mapping.chunk);

            if (isJsonStringified) {
                // FIXME: ugly
                newColumn += JSON.stringify(mapping.chunk).length - 1;
            } else {
                if (mapping = map.mapping[i + 1]) {
                    newLine = mapping.generatedLine + offsetLine;
                    newColumn = mapping.generatedColumn; // + offsetColumn;
                }
            }
        }, this);

        Object.keys(map.sources).forEach(function(file) {
            this.createSource(file, map.sources[file].content);
        }, this);
    },

    generate: function(fileName, root) {
        var generator = this.generator = new SOURCEMAP.SourceMapGenerator({
                file: fileName
                //sourceRoot: PATH.dirname(PATH.resolve(path))
            }),
            seenSources = {};

        this.eachMapping(function(mapping, i, source) {
            var sourcePath = PATH.relative(root, mapping.source);
            generator.addMapping({
                source: sourcePath,
                generated: {
                    line: mapping.generatedLine,
                    column: mapping.generatedColumn
                },
                original: {
                    line: mapping.originalLine,
                    column: mapping.originalColumn
                }
            });

            if(source && !seenSources[sourcePath]) {
                // FIXME: `setSourceContent` should be invoked only ones for each source
                seenSources[sourcePath] = true;
                generator.setSourceContent(sourcePath, source.content);
            }
        });

        return generator;
    }

    // TODO: unglify -> inSourceMap
//            replace: function(newMap) {
//                var consumer = new SOURCEMAP.SourceMapConsumer(newMap);
//                this.generator = SOURCEMAP.SourceMapGenerator.fromSourceMap(consumer);
//            }


});
