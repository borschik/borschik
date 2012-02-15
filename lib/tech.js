var FS = require('fs'),
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
                if (typeof output === 'string') {
                    FS.writeFileSync(output, this.process(this.path));
                } else {
                    output.write(this.process(this.path));
                }

                return this;
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
