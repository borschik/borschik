const fs = require('fs');
const sourceMapResolve = require('source-map-resolve');
const SourceMapConsumer = require('source-map').SourceMapConsumer;
const MappingsIterator = require('./mappings-iterator');


class SourceMapRegistry {
    /**
     * @param {String} options.sourceMapLocation 'inline' or 'file'.
     */
    constructor(options) {
        this.options = options;

        /**
         * @type {Object.<String, Object[]>}
         */
        this.mappings = {};
    }

    /**
     * @param {String} filepath
     * @returns {MappingsIterator|null}
     */
    getMappingsIterator(filepath) {
        const mappings = this.mappings;
        const found = mappings[filepath];
        if (found !== undefined) {
            return found;
        }

        const sourceMap = this.getSourceMapForFile(filepath);
        if (sourceMap) {
            const fileMappings = this.getMappingsFromSourceMap(sourceMap);
            if (fileMappings.length) {
                return mappings[filepath] = new MappingsIterator(fileMappings);
            }
        }

        return mappings[filepath] = null;
    }

    getMappingsFromSourceMap(sourceMap) {
        const mappings = [];

        sourceMap.eachMapping(m => {
            mappings.push(m);
        });

        return mappings;
    }

    getSourceMapForFile(filepath) {
        if (this.options.sourceMapLocation === 'file') {
            try {
                const mapContent = fs.readFileSync(filepath + '.map', { encoding: 'utf8' }).toString();

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
            const content = fs.readFileSync(filepath, { encoding: 'utf8' }).toString();
            const resolved = sourceMapResolve.resolveSourceMapSync(content, filepath, fs.readFileSync);

            if (resolved && resolved.map) {
                return new SourceMapConsumer(resolved.map);
            }
        }

        return null;
    }
}

module.exports = SourceMapRegistry;
