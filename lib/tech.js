var fs = require('fs').promises;
var PATH = require('path');

var freeze = require('./freeze');
var util = require('./util');

class File {
    constructor(tech, path, type, parent) {
        this.tech = tech;
        // realpathSync processes path with "follow_symlinks" directive
        this.path = PATH.resolve(PATH.dirname(path), freeze.realpathSync(path));
        this.childType = type || 'include';
        this.parent = parent;
        this.children = {};
    }

    parse(content) {
        return this.childType == 'include'?
            this.parseInclude(content) : this.parseLink(content);
    }

    parseInclude(content) {
        return content;
    }

    parseLink(content) {
        return this.path;
    }

    async read() {
        this.content = this.parse(await fs.readFile(await this.processPath(this.path)));
        return this;
    }

    async processPath(path) {
        return path;
    }

    async process(path) {
        return this.childType == 'include'?
            this.processInclude(path) : this.processLink(path);
    }

    async processInclude(path) {
        return this.content;
    }

    async processLink(path) {
        return this.pathFrom(path);
    }

    async child(type, path) {
        const children = this.children;
        const key = type + '|' + path;
        children[key] = children[key] || await this.tech.createFile(this.pathTo(path), type, this)

        return children[key];
    }

    /**
     * Returns absolute path to resource relative to current file.
     * @param {string} resourcePath Path to resource relative to current file.
     * @returns {string}
     * @example
     * // current file (this.path) /home/user/site/css/page.css
     * this.pathTo(img/bg.png); // /home/user/site/css/img/bg.png
     */
    pathTo(resourcePath) {
        return util.pathToUnix(PATH.resolve(PATH.dirname(this.path), resourcePath));
    }

    pathFrom(path) {
        return util.pathToUnix(PATH.relative(PATH.dirname(path), this.path));
    }
}

class Tech {
    constructor(opts) {
        this.opts = opts;

        /**
         * Hash of processed files to remove duplicates.
         * @type {Object}
         */
        this.processedFiles = {};
    }

    async createFile(path, type, parent) {
        var file = new this.File(this, path, type, parent);
        if (type == 'include') await file.read();
        return file;
    }

    async process() {
        const res = await this.handleMinimization(await this.handleIncludes());

        const out = this.opts.output;

        if (this.opts.inputString && !out.path) {
            return res;
        } else {
            return await this.write(out, res);
        }
    }

    async handleIncludes() {
        if (this.opts.input) {
            const file = await this.createFile(this.opts.input, 'include')
            return await file.process(this.opts.input);
        } else {
            var fakeFile = PATH.join(this.opts.basePath, this.opts.baseFilename || 'borschik.fakefile');
            var file = new this.File(this, fakeFile, 'include');
            file.content = file.parse(this.opts.inputString);

            return await file.process(fakeFile);
        }
    }

    async handleMinimization(content) {
        if (!this.opts.minimize) {
            return content;
        }

        try {
            return await this.minimize(content);
        } catch(e) {
            const path = this.opts.input;
            const out = this.opts.output;

            if (this.opts.inputString && !out.path) {
                throw e;
            }

            // if output is the path
            if (out.path) {
                // close current output stream
                out.end();

                if (path != out.path) {
                    try {
                        // remove empty output file if input != ouput
                        await fs.unlink(out.path);
                    } catch(e) {}
                }
            }

            // open new stream for error result
            let errorFilename;
            if (out.path) {
                errorFilename = out.path + '.borschik-error';
            } else {
                errorFilename = PATH.resolve(process.cwd(), 'borschik-error');
            }

            await fs.writeFile(errorFilename, content, { encoding: 'utf8' });

            throw e;
        }
    }

    async minimize(content) {
        return content;
    }

    write = util.writeFile;
    File = File;
}

module.exports = {
    Tech,
    File
}
