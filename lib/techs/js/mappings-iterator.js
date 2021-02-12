class MappingsIterator{
    /**
     * @typedef {Object} Mapping Source mapping object.
     */
     /**
     * @param {Mapping[]} mappings
     */
    constructor(mappings) {
        this.mappings = mappings;
        this.position = 0;
        this.lastLine = 1;
        this.lastColumn = 0;
    }

    /**
     * @callback whileCallback
     * @param {Mapping} mapping
     * @return {Boolean}
     */
    /**
     * @param {whileCallback} fn
     */
    skipWhile(fn) {
        var mappings = this.mappings;
        var len = mappings.length;

        while (this.position < len) {
            var mapping = mappings[this.position];
            if (!fn(mapping)) {
                break;
            }
            ++this.position;
        }
    }

    /**
     * @param {whileCallback} fn
     * @returns {Mapping[]}
     */
    readWhile(fn) {
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
    }

    /**
     * @callback eachMappingCallback
     * @param {Mapping} mapping
     */
     /**
     * @param {eachMappingCallback} fn
     */
    eachMapping(fn) {
        var mappings = this.mappings;
        var len = mappings.length;

        while (this.position < len) {
            fn(mappings[this.position]);
            ++this.position;
        }
    }

    /**
     * @returns {Mapping}
     */
    current() {
        return this.mappings[this.position];
    }
}

module.exports = MappingsIterator;
