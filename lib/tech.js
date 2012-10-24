var Q = require('q'),
    FS = require('./fs'),
    QFS = require('q-fs'),
    PATH = require('path'),
    INHERIT = require('inherit'),
    U = require('./util');

exports.Tech = INHERIT({

        createFile: function(path, type, parent) {
            var file = new this.File(this, path, type, parent);
            if (type == 'include') file.read();
            return file;
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
                return children[path] || (children[path] = this.tech.createFile(this.pathTo(path), type, this));
            },

            pathTo: function(path) {
                return U.pathToUnix(PATH.resolve(PATH.dirname(this.path), path));
            },

            pathFrom: function(path) {
                return U.pathToUnix(PATH.relative(PATH.dirname(path), this.path));
            }

        })

    });
