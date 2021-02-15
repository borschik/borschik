const PATH = require('path');

const freeze = require('../freeze');
const {Tech: BaseTech, File: BaseFile } = require('../tech');

/**
 * RegExp to check if url is inlined content.
 * Checks for
 * data:image/gif;base64,
 * data:image/gif,
 * @type {RegExp}
 */
const RE_INLINED_CONTENT = /^data:\w+\/[-+\w;]+,/;

class File extends BaseFile {
    async processLink(path) {
        let url = this.path;

        let queryPostfix = '';
        let hashPostfix = '';

        // filter.svg?foo=bar
        // filter.svg#filterId
        // filter.svg?foo=bar#filterId
        const queryIndex = url.indexOf('?');
        if (queryIndex > -1) {
            queryPostfix = url.substring(queryIndex);
            url = url.substring(0, queryIndex);
        }

        const hashIndex =  url.indexOf('#');
        if (hashIndex > -1) {
            hashPostfix = url.substring(hashIndex);
            url = url.substring(0, hashIndex);
        }

        if (this.tech.opts.freeze && this.isFreezableUrl(url)) {
            try {
                url = freeze.processPath(url);
            } catch(e) {
                // Find all parents for better error message
                const message = [e.message];
                let parentFile = this.parent;
                while (parentFile && parentFile.path) {
                    message.push('  -> ' + parentFile.path);
                    parentFile = parentFile.parent;
                }
                throw new Error(message.join('\n'));
            }
        }

        // if url isn't inlined
        if (!RE_INLINED_CONTENT.test(url)) {
            const resolved = freeze.resolveUrl2(url);

            if (resolved == url) {
                url = PATH.relative(PATH.dirname(path), url);

            } else {
                url = resolved;
            }

            // adds GET parameters
            url += queryPostfix;
        }

        url += hashPostfix;

        return JSON.stringify(url).replace(/\\\\/g, '/');
    }

    isFreezableUrl(url) {
        return freeze.isFreezableUrl(url);
    }
}

class CssBaseTech extends BaseTech {
    constructor() {
        super(...arguments);
        this.File = File;
    }

    async minimize(content) {
        return require('csso').minify(content).css;
    }
}

module.exports = {
    Tech: CssBaseTech,
    File
};