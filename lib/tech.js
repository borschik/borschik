var FS = require('fs'),
    PATH = require('path'),
    URL = require('url'),
    FREEZE = require('./freeze'),
    INHERIT = require('inherit'),
    U = require('./util'),
    Cache = require('./cache'),
    VOW = require('vow');

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
            this.cache = new Cache();
        },

        createFile: function(path, type, parent) {
            var file = new this.File(this, path, type, parent),
                filename = file.processPath(file.path),
                cacheData = file.getCacheData(),
                processedContent = this.cache.getProcessedContent(filename, cacheData);

            if (processedContent) {
                file.content = processedContent;
            } else if (type == 'include') {
                file.read();
            }

            return file;
        },

        process: function() {
            var res;
            var path = this.opts.input;
            if (path) {
                res = this.createFile(path, 'include').process(path);
            } else {
                var fakeFile = PATH.join(this.opts.basePath, 'borschik.fakefile');
                var file = new this.File(this, fakeFile, 'include');
                file.content = file.parse(this.opts.inputString);
                //TODO: i call ctor with path and then call method with same path. WTF?
                res = file.process(fakeFile);
            }
            // NOTE: Passing path of source file into process(). This could lead to
            // incorrect paths in the resulting file if it will be stored in another
            // directory then source file.

            var out = this.opts.output;
            if (this.opts.minimize) {
                try {
                    res = this.minimize(res);

                } catch(e) {
                    if (this.opts.inputString && !out.path) {
                        return VOW.reject(e);
                    }

                    var errorMessage = e.toString();

                    // if output is the path
                    if (out.path) {
                        // close current output stream
                        out.end();

                        if (path != out.path) {
                            try {
                                // remove empty output file if input != ouput
                                FS.unlinkSync(out.path);
                            } catch(e) {}
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
                        throw new Error(errorMessage);
                    });
                }
            }

            if (this.opts.inputString && !this.opts.output.path) {
                return VOW.resolve(res);
            } else {
                return this.write(out, res);
            }
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
                var isFake = this.isFakeFile();

                if (isFake) {
                    return this.childType == 'include'?
                        this.processInclude(path) : this.processLink(path);
                }

                var cache = this.tech.cache,
                    cacheData = this.getCacheData(),
                    filename = this.processPath(this.path),
                    processedContent = cache.getProcessedContent(filename, cacheData);

                if (processedContent) {
                    return processedContent;
                }

                processedContent = this.childType == 'include'?
                    this.processInclude(path) : this.processLink(path);

                cache.setProcessedContent(filename, processedContent, cacheData);

                return processedContent;
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
            },

            isFakeFile: function() {
                var basename = PATH.basename(this.path);

                return basename === 'borschik.fakefile';
            },

            getCacheData: function() {
                var opts = this.tech.opts,
                    mainPath = opts.input,
                    techName = opts.tech || mainPath && PATH.extname(mainPath).substr(1),
                    techOptions = opts.techOptions || {};

                techOptions.freeze || (techOptions.freeze = opts.freeze);
                techOptions.minimize || (techOptions.freeze = opts.minimize);

                return {
                    tech: techName,
                    techOptions: techOptions,
                    childType: this.childType,
                    mainPath: mainPath,
                    path: this.path
                };
            }

        }, {
            inherit: _inherit
        })

    }, {
        inherit: _inherit
    });
