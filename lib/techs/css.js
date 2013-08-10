var base = require('./css-base'),
    U = require('../util'),

    stringRe = "(?:(?:'[^'\\r\\n]*')|(?:\"[^\"\\r\\n]*\"))",
    urlRe = "(?:(?:url\\(\\s*" + stringRe + "\\s*\\))|(?:url\\(\\s*[^\\s\\r\\n'\"]*\\s*\\)))",
    srcRe = "(?:src\\s*=\\s*[^,\)]+)",
    commentRe = '(?:/\\*[^*]*\\*+(?:[^/][^*]*\\*+)*/)',
    importRe = '(?:\\@import\\s+(' + urlRe + '|' + stringRe + ');?)',
    allRe = new RegExp(commentRe + '|' + importRe + '|' + urlRe + '|' + srcRe, 'g'),
    urlStringRx = new RegExp('^' + urlRe + '$'),
    srcStringRx = new RegExp('^' + srcRe + '$');

exports.Tech = base.Tech.inherit({
    File: exports.File = base.File.inherit({

        parseInclude: function(content) {
            var m, found = [];

            if (Buffer.isBuffer(content)) content = content.toString('utf8');

            while (m = allRe.exec(content)) {
                if (m[0].lastIndexOf('/*', 0) === 0) {
                    // skip comment
                } else if (m[0].charAt(0) === '@') {
                    // @import
                    var url = parseUrl(m[1]);
                    if (isIncludeProcessable(url)) {

                        var chunk = {
                            url: url,
                            range: [m.index, allRe.lastIndex]
                        };

                        var absPath = this.pathTo(url);
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
                    var url = parseUrl(m[0]);
                    if (U.isLinkProcessable(url)) found.push({
                        type: 'linkUrl',
                        url: url,
                        range: [m.index, allRe.lastIndex - 1]
                    });
                } else if (srcStringRx.test(m[0])) {
                    // src=... 
                    var src = parseSrc(m[0]);
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
        },

        processInclude: function(path, content) {
            var parsed = content || this.content;

            for(var i = 0; i < parsed.length; i++) {
                var item = parsed[i];

                if (typeof item === 'string') continue;

                // ignore duplicate file
                if (item.type === 'duplicate') {
                    parsed[i] = '';
                    continue;
                }

                if (item.type === 'include') {
                    var comments = this.tech.opts.comments;
                    parsed[i] = (comments ? '/* ' + item.url + ' begin */\n' : '') +
                        this.child('include', item.url).process(path) +
                        (comments ? '\n/* ' + item.url + ' end */\n' : '');

                    continue;
                }

                parsed[i] = this.child(item.type, item.url).process(path);
            }

            return parsed.join('');
        },

        processLink: function(path) {
            if (this.childType === 'linkUrl') return 'url(' + this.__base(path) + ')';
            if (this.childType === 'linkSrc') return 'src=' + this.__base(path);
         },

        processPath: function(path) {
            return path.replace(/^(.*?)(\?|$)/, '$1');
        }

    })
});

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
    var result = [],
        lastInd = 0;

    items.forEach(function(item) {
        if (lastInd > item.range[0]) throw 'index out of range';

        if (lastInd < item.range[0]) result.push(content.substring(lastInd, item.range[0]));

        result.push(item);
        lastInd = item.range[1] + 1;
    });

    if (lastInd < content.length) result.push(content.substring(lastInd));

    return result;
}
