var FS = require('./fs'),
    PATH = require('path'),
    FREEZE = require('./freeze'),
    MAP = require('./sourcemap'),
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
            var file = this.createFile(path, 'include'),
                map = file.map,
                res = file.process(path);

            if (this.opts.minimize) {
                res = this.minimize(res, map);
            }

            if (this.opts.sourceMap && map) {
                res = this.sourcemap(res, map, out);
            }

            return this.write(out, res);
        },

        write: U.writeFile,

        minimize: function(content, map) {
            return content;
        },

        sourcemap: function(content, map, out) {
            if (typeof out === 'undefined') {
                return content;
            }

            if (typeof out !== 'string' && out.path) {
                out = out.path;
            }

            var outName = PATH.basename(out),
                outRoot = PATH.dirname(out),
                mapName = outName + '.map';

            return this.write(PATH.join(outRoot, mapName), map.generate(outName, outRoot).toString())
                .then(function() {
                    return this.sourceMappingURL(mapName, content);
                }.bind(this));
        },

        sourceMappingURL: function(path, content) {
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
                this.map = new MAP.SourceMap(this);
            },

            read: function() {
                var content = FS.readFileSync(this.processPath(this.path));

                this.content = this.parse(content);
                this.map.createSource(this.path, content);

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

                if (!children[key]) {
                    children[key] = this.tech.createFile(this.pathTo(path), type, this);
                }

                return children[key];
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

            countLines: function(content) {
                return content.split('\n').length - 1;
            },

            addMapping: function() {
                this.map.addMapping.apply(this.map, arguments);
            },

            combineMaps: function(map, offset, isJsonStringified) {
                this.map.combine(map, offset, isJsonStringified);
            }

        }, {
            inherit: _inherit
        })

    }, {
        inherit: _inherit
    });
