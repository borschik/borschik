var FS = require('fs'),
    PATH = require('path'),
    FREEZE = require('./freeze'),
    INHERIT = require('inherit'),
    U = require('./util');

function _inherit(d, s) {
    return INHERIT(this, d, s);
}

exports.Tech = INHERIT({

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

        process: function(path, out) {
            // NOTE: Passing path of source file into process(). This could lead to
            // incorrect paths in the resulting file if it will be stored in another
            // directory then source file.
            var res = this.createFile(path, 'include').process(path);
            if (this.opts.minimize) {
                try {
                    res = this.minimize(res);

                } catch(e) {
                    var errorMessage = e.toString();

                    // if output is the path
                    if (out.path) {
                        // close current output stream
                        out.end();

                        if (path != out.path) {
                            // remove empty output file if input != ouput
                            FS.unlinkSync(out.path);
                        }
                    }

                    // open new stream for error result
                    var errorFilename;
                    if (out.path) {
                        errorFilename = out.path + '.borschik-error';
                    } else {
                        errorFilename = PATH.resolve(process.cwd(), 'borschik-error');
                    }

                    out = FS.createWriteStream(errorFilename, {
                        encoding: 'utf8'
                    });

                    errorMessage += '\nError result in ' + errorFilename;

                    return this.write(out, res).then(function() {
                        throw errorMessage;
                    });

                }
            }

            return this.write(out, res);
        },

        write: U.writeFile,

        minimize: function(content) {
            return content;
        },

        File: exports.File = INHERIT({

            __constructor: function(tech, path, type, parent) {
                this.tech = tech;
                // realpathSync processes path with "follow_symlinks" directive
                this.path = PATH.resolve(PATH.dirname(path), FREEZE.realpathSync(path));
                this.childType = type || 'include';
                this.parent = parent;
                this.children = {};
            },

            read: function() {
                this.content = this.parse(FS.readFileSync(this.processPath(this.path)));
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
                var children = this.children,
                    key = type + '|' + path;
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
                return U.pathToUnix(PATH.resolve(PATH.dirname(this.path), resourcePath));
            },

            pathFrom: function(path) {
                return U.pathToUnix(PATH.relative(PATH.dirname(path), this.path));
            }

        }, {
            inherit: _inherit
        })

    }, {
        inherit: _inherit
    });
