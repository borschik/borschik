var Q = require('q'),
    FS = require('./fs'),
    QFS = require('q-fs'),
    PATH = require('path'),
    INHERIT = require('inherit'),
    U = require('./util');

exports.Tech = INHERIT({

        __constructor: function(opts) {
            this.opts = opts;
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
            return U.writeFile(out, this.opts.minimize? this.minimize(res) : res);
        },

        minimize: function(content) {
            return content;
        },

        File: exports.File = INHERIT({

            __constructor: function(tech, path, type, parent) {
                this.tech = tech;
                this.path = path;
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

            write: function(output) {
                return U.writeFile(output, this.process(this.path));
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

            pathTo: function(path) {
                return U.pathToUnix(PATH.resolve(PATH.dirname(this.path), path));
            },

            pathFrom: function(path) {
                return U.pathToUnix(PATH.relative(PATH.dirname(path), this.path));
            }

        })

    });
