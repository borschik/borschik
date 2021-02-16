const fs = require('fs');
const path = require('path');

const {Tech: BaseTech, File: BaseFile } = require('./css-base');

const error = require('../error');
const utils = require('../util');

const nodes = require('./js/nodes');
const NodesSerializer = require('./js/nodes-serializer');

class File extends BaseFile {
    parseInclude(content) {
        if (Buffer.isBuffer(content)) {
            content = content.toString('utf8');
        }

        const allIncRe = new RegExp([
                ['\\{/\\*!?', '\\*/\\}'],
                ['\\[/\\*!?', '\\*/\\]'],
                ['/\\*!?', '\\*/'],
                ['[\'"]', '[\'"]']
            ]
            .map(function(i) {
                return ['(?:', i[0], '\\s*borschik:include:(.*?)\\s*', i[1], ')'].join('');
            })
            .join('|')
            + '|' +
            // RegExp to find borschik.link("path/to/image.png")
            'borschik\\.link\\([\'"]([^@][^"\']+?)[\'"]\\)'
            + '|' +
            // RegExp to find borschik.include("path/to/file.js")
            'borschik\\.include\\([\'"]([^@][^"\']+?)[\'"]\\)',
            'g');

        const uniqStr = '\u0000borschik\u0000';
        const _this = this;

        const includes = [];
        const texts = content
            // Finds /*borschik:include:*/, "borschik:include:", borschik.include(), borschik.link().
            .replace(allIncRe, function(_, incObjectFile, incArrayFile, incCommFile, incStrFile, borschikLink, borschikInc) {
                const incFile = incObjectFile || incArrayFile || incCommFile || incStrFile || borschikInc;
                if (incFile) {
                    includes.push({
                        file: _this.pathTo(incFile),
                        type: incStrFile? 'include-json' : 'include-inline',
                        directive: _
                    });
                } else {
                    includes.push({
                        file: _this.pathTo(borschikLink),
                        type: 'link-url',
                        directive: _
                    });
                }

                return uniqStr;

            })
            .split(uniqStr);

        // zip texts and includes
        let res = [], t, i;
        while((t = texts.shift()) != null) {
            t && res.push(t);
            (i = includes.shift()) && res.push(i);
        }

        return res;
    }

    async processInclude(baseFile, content) {
        const opts = this.tech.opts;

        const parsed = await Promise.all(
            (content || this.content).map(async item => {
                if (typeof item === 'string') {
                    return new nodes.StringNode(item, this.path);
                }

                if (item.type === 'link-url') {
                    const childFile = await this.child(item.type, item.file);
                    const childContent = await childFile.process(baseFile);
                    return new nodes.LinkURLNode(childContent, this.path, item.directive);
                }

                if (!fs.existsSync(item.file)) {
                    throw new Error('File ' + item.file + ' does not exists, base file is ' + baseFile);
                }

                const childFile = await this.child('include', item.file);
                const processed = await childFile.process(baseFile);

                if (item.type === 'include-inline') {
                    const node = new nodes.IncludeNode(processed, this.path, item.directive);
                    if (opts.comments) {
                        node.addCommentsWrap(path.relative(path.dirname(baseFile), item.file));
                    }

                    return node;
                }

                return new nodes.IncludeJSONNode(processed, this.path, item.directive);
            })
        );

        if (this.parent) {
            return parsed;
        }

        const techOpts = opts.techOptions;
        const outPath = opts.output.path || '';
        const serializer = new NodesSerializer(parsed, {
            inputSourceMap: techOpts.inputSourceMap,
            sourceMap: techOpts.sourceMap,
            sourceMapSourceRoot: techOpts.sourceMapSourceRoot,
            sourceMapRoot: techOpts.sourceMapRoot || path.dirname(outPath),
            sourceMapFilename: techOpts.sourceMapFilename || path.basename(outPath)
        });

        return serializer.serialize();
    }
}

class JSTech extends BaseTech {
    constructor() {
        super(...arguments);
        this.File = File;
    }

    async process() {
        const opts = this.opts;
        const out = opts.output;
        const techOpts = opts.techOptions;

        const processed = await this.handleIncludes();
        let content = processed.getContent();
        let sourceMap = processed.getSourceMap();

        if (opts.minimize) {
            // By default, borschik maintains actual state of the source map on the minification step.
            // But there are rare cases when such behaviour may be inappropriate, e.g., when the original
            // source map (after processing) is used to restore coverage info (see `istanbul-lib-source-maps`).
            const minifySourceMap = sourceMap && techOpts.minifySourceMap !== false;
            // Pass original source map to `uglify-es`.
            const uglifyOptions = techOpts.uglify || (techOpts.uglify = {});
            uglifyOptions.sourceMap = minifySourceMap ? { content: sourceMap } : undefined;

            const minimized = await this.handleMinimization(content);
            content = minimized.code;
            if (minifySourceMap) {
                sourceMap = minimized.map;
            }
        }

        if (sourceMap) {
            // Add source mapping URL comment (with dataurl or .map file).
            content += this.buildSourceMapURLComment(sourceMap);
        }

        if (opts.inputString && !out.path) {
            // `content`-only resolve is for backward compatibility.
            return sourceMap ? [content, sourceMap] : content;
        }

        return Promise.all([
            this.write(out, content),
            sourceMap ? this.write(this.sourceMapPath(), sourceMap) : Promise.resolve()
        ]);
    }

    async minimize(content) {
        const UglifyJS = require('uglify-es');
        try {
            const uglifyOptions = this.opts.techOptions.uglify || {};

            const res = UglifyJS.minify(content, uglifyOptions);

            if (res.error) throw res.error;

            return res;

        } catch(e) {
            // create better error message
            const lines = content.split('\n');
            throw error.explain(lines, e);
        }
    }

    buildSourceMapURLComment(sourceMap) {
        const techOpts = this.opts.techOptions;
        if (techOpts.sourceMapURL === false) {
            return '';
        }

        return techOpts.sourceMap === 'inline'
            ? utils.buildSourceMapURLComment({ inline: sourceMap })
            : utils.buildSourceMapURLComment({ url: techOpts.sourceMapURL || path.basename(this.sourceMapPath()) });
    }

    sourceMapPath() {
        return (this.opts.output.path || this.opts.baseFilename || '') + '.map';
    }
}

module.exports = {
    Tech: JSTech,
    File
}
