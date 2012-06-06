var Q = require('q'),
    FS = require('fs'),
    QFS = require('q-fs'),
    PATH = require('./path'),
    INHERIT = require('inherit'),

    Tech = exports.Tech = INHERIT({

        __constructor: function() {},

        createFile: function(path, type, parent) {
            return new this.File(this, path, type, parent)
        },

        File: exports.File = INHERIT({

            __constructor: function(tech, path, type, parent) {
                this.tech = tech;
                this.path = path;
                this.childType = type || 'include';
                this.parent = parent;
                this.childs = {};
            },

            read: function() {
                this.content = this.parse(FS.readFileSync(this.path));
                return this;
            },

            parse: function(content) {
                return this.childType == 'include' ?
                    this.parseInclude(content) : this.parseLink(content)
            },

            parseInclude: function(content) { return content },

            parseLink: function(content) { return this.path },

            write: function(output) {
                var res = this.process(this.path);

                // save res to file
                if (typeof output === 'string') {
                    return QFS.write(output, res);
                }

                // output res to stdout
                if (output === process.stdout) {
                    output.write(res);
                    return Q.resolve();
                }

                // write res to writable stream of opened file
                var defer = Q.defer();

                output.on('error', function(err) {
                    defer.reject(err);
                });

                output.once('close', function() {
                    defer.resolve();
                });

                output.once('end', function() {
                    defer.resolve();
                });

                output.write(res);
                output.end();

                return defer.promise;
            },

            process: function(path) {
                return this.childType == 'include' ?
                    this.processInclude(path) : this.processLink(path)
            },

            processInclude: function(path) { return this.content },

            processLink: function(path) {
                return this.pathFrom(path)
            },

            child: function(type, path) {
                var childs = this.childs;
                return childs[path] ||
                    (childs[path] = this.tech.createFile(this.pathTo(path), type, this)).read(); // TODO: tech
            },

            pathTo: function(path) { return PATH.resolve(PATH.dirname(this.path), path) },

            pathFrom: function(path) { return PATH.relative(path, this.path) }

        })
    });
