const url = require('url');

const {Tech: BaseTech, File: BaseFile } = require('./css-base');
const U = require('../util');

const stringRe = "(?:(?:'[^'\\r\\n]*')|(?:\"[^\"\\r\\n]*\"))";
const urlRe = "(?:(?:\\burl\\(\\s*" + stringRe + "\\s*\\))|(?:\\burl\\(\\s*[^\\s\\r\\n'\"]*\\s*\\)))";
const srcRe = "(?:src\\s*=\\s*[^,)]+)";
const commentRe = '(?:/\\*[^*]*\\*+(?:[^/][^*]*\\*+)*/)';
const importRe = '(?:\\@import\\s+(' + urlRe + '|' + stringRe + ');?)';
const allRe = new RegExp(commentRe + '|' + importRe + '|' + urlRe + '|' + srcRe, 'g');
const urlStringRx = new RegExp('^' + urlRe + '$');
const srcStringRx = new RegExp('^' + srcRe + '$');

class File extends BaseFile {
    parseInclude(content) {
        const found = [];
        let m;

        if (Buffer.isBuffer(content)) content = content.toString('utf8');

        while (m = allRe.exec(content)) {
            if (m[0].lastIndexOf('/*', 0) === 0) {
                // skip comment
            } else if (m[0].charAt(0) === '@') {
                // @import
                const url = parseUrl(m[1]);
                if (isIncludeProcessable(url)) {

                    const chunk = {
                        url: url,
                        range: [m.index, allRe.lastIndex]
                    };

                    const absPath = this.pathTo(url);
                    // check for duplicates
                    if (absPath in this.tech.processedFiles) {
                        if (this.tech.opts.warnings) {
                            console.warn('*** WARNING', absPath + ' was already included in ' + this.tech.processedFiles[absPath] + ' and will be skipped.');
                        }
                        chunk.type = 'duplicate';

                    } else {
                        // save included path to check duplicates
                        this.tech.processedFiles[absPath] = this.path;
                        chunk.type = 'include';
                    }

                    found.push(chunk)
                }
            } else if (urlStringRx.test(m[0])) {
                // url(...)
                const url = parseUrl(m[0]);
                if (U.isLinkProcessable(url)) found.push({
                    type: 'linkUrl',
                    url: url,
                    range: [m.index, allRe.lastIndex - 1]
                });
            } else if (srcStringRx.test(m[0])) {
                // src=...
                const src = parseSrc(m[0]);
                if (U.isLinkProcessable(src)) found.push({
                    type: 'linkSrc',
                    url: src,
                    range: [m.index, allRe.lastIndex - 1]
                });
            } else {
                throw new Error('Failed to match: ' + m[0]);
            }
        }

        return makeParsed(found, content);
    }

    async processInclude(path, content) {
        const parsed = content || this.content;

        for(let i = 0; i < parsed.length; i++) {
            const item = parsed[i];

            if (typeof item === 'string') continue;

            // ignore duplicate file
            if (item.type === 'duplicate') {
                parsed[i] = '';
                continue;
            }

            const childFile = await this.child(item.type, item.url);
            const childContent = await childFile.process(path);

            if (item.type === 'include') {
                const comments = this.tech.opts.comments;
                parsed[i] = (comments ? '/* ' + item.url + ' begin */\n' : '') +
                    childContent +
                    (comments ? '\n/* ' + item.url + ' end */\n' : '');

                continue;
            }

            parsed[i] = childContent;
        }

        return parsed.join('');
    }

    async processLink(path) {
        if (this.childType === 'linkUrl') return 'url(' + await super.processLink(path) + ')';
        if (this.childType === 'linkSrc') return 'src=' + await super.processLink(path);
     }

    async processPath(path) {
        return typeof path === 'string' ? url.parse(path).pathname : '';
    }
}

class CssTech extends BaseTech {
    constructor() {
        super(...arguments);
        this.File = File;
    }
}

function isIncludeProcessable(url) {
   return !isAbsoluteUrl(url);
}

function isAbsoluteUrl(url) {
    return /^\w+:/.test(url);
}

function parseUrl(url) {
    if (url.lastIndexOf('url(', 0) === 0) url = url.replace(/^url\(\s*/, '').replace(/\s*\)$/, '');

    if (url.charAt(0) === '\'' || url.charAt(0) === '"') url = url.substr(1, url.length - 2);

    return url;
}

function parseSrc(src) {
    src = src.replace(/^src\s*=\s*/, '').replace(/\s*\)$/, '');

    if (src.charAt(0) === '\'' || src.charAt(0) === '"') src = src.substr(1, src.length - 2);

    return src;
}

function makeParsed(items, content) {
    const result = [];
    let lastInd = 0;

    items.forEach(function(item) {
        if (lastInd > item.range[0]) throw 'index out of range';

        if (lastInd < item.range[0]) result.push(content.substring(lastInd, item.range[0]));

        result.push(item);
        lastInd = item.range[1] + 1;
    });

    if (lastInd < content.length) result.push(content.substring(lastInd));

    return result;
}

module.exports = {
    Tech: CssTech,
    File
};