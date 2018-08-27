var fs = require('fs');
var PATH = require('path');

var inherit = require('inherit');
var vow = require('vow');

var freeze = require('./freeze');
var util = require('./util');

function _inherit(d, s) {
    return inherit(this, d, s);
}

exports.Tech = inherit({
    __constructor: function(opts) {
        this.opts = opts;

        /**
         * Hash of processed files to remove duplicates.
         * @type {Object}
         */
        this.processedFiles = {};
    },

    createFile: function(path, type, parent) {
        var file = new this.File(this, path, type, parent);
        if (type == 'include') file.read();
        return file;
    },

    process: function() {
        try {
            var res = this.handleMinimization(this.handleIncludes());
        } catch(e) {
            return vow.reject(e);
        }

        var out = this.opts.output;

        if (this.opts.inputString && !out.path) {
            return vow.resolve(res);
        } else {
            return this.write(out, res);
        }
    },

    handleIncludes: function() {
        if (this.opts.input) {
            return this.createFile(this.opts.input, 'include').process(this.opts.input);
        } else {
            var fakeFile = PATH.join(this.opts.basePath, this.opts.baseFilename || 'borschik.fakefile');
            var file = new this.File(this, fakeFile, 'include');
            file.content = file.parse(this.opts.inputString);

            return file.process(fakeFile);
        }
    },

    handleMinimization: function(content) {
        if (!this.opts.minimize) {
            return content;
        }

        try {
            return this.minimize(content);
        } catch(e) {
            var path = this.opts.input;
            var out = this.opts.output;

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
                        fs.unlinkSync(out.path);
                    } catch(e) {}
                }
            }

            var errorMessage = e.toString() + '\nError result in ' + errorFilename;
            // open new stream for error result
            var errorFilename;
            if (out.path) {
                errorFilename = out.path + '.borschik-error';
            } else {
                errorFilename = PATH.resolve(process.cwd(), 'borschik-error');
            }

            fs.writeFileSync(errorFilename, content, { encoding: 'utf8' });

            throw e;
        }
    },

    write: util.writeFile,

    minimize: function(content) {
        return content;
    },

    File: exports.File = inherit({
        __constructor: function(tech, path, type, parent) {
            this.tech = tech;
            // realpathSync processes path with "follow_symlinks" directive
            this.path = PATH.resolve(PATH.dirname(path), freeze.realpathSync(path));
            this.childType = type || 'include';
            this.parent = parent;
            this.children = {};
        },

        read: function() {
            this.content = this.parse(fs.readFileSync(this.processPath(this.path)));
            return this;
        },

        processPath: function(path) {
            return path;
        },

        parse: function(content) {
            return this.childType == 'include'?
                this.parseInclude(content) : this.parseLink(content);
        },

        parseInclude: function(content) {
            return content;
        },

        parseLink: function(content) {
            return this.path;
        },

        process: function(path) {
            return this.childType == 'include'?
                this.processInclude(path) : this.processLink(path);
        },

        processInclude: function(path) {
            return this.content;
        },

        processLink: function(path) {
            return this.pathFrom(path);
        },

        child: function(type, path) {
            var children = this.children;
            var key = type + '|' + path;

            return children[key] || (children[key] = this.tech.createFile(this.pathTo(path), type, this));
        },

        /**
         * Returns absolute path to resource relative to current file.
         * @param {string} resourcePath Path to resource relative to current file.
         * @returns {string}
         * @example
         * // current file (this.path) /home/user/site/css/page.css
         * this.pathTo(img/bg.png); // /home/user/site/css/img/bg.png
         */
        pathTo: function(resourcePath) {
            return util.pathToUnix(PATH.resolve(PATH.dirname(this.path), resourcePath));
        },

        pathFrom: function(path) {
            return util.pathToUnix(PATH.relative(PATH.dirname(path), this.path));
        }
    }, {
        inherit: _inherit
    })
}, {
    inherit: _inherit
});
