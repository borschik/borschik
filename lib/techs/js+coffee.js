var COFFEE = require('coffee-script'),
    INHERIT = require('inherit'),
    PATH = require('path'),
    base = require('./js.js');

exports.Tech = INHERIT(base.Tech, {

    File: exports.File = INHERIT(base.File, {

        parseInclude: function(content) {

            if (Buffer.isBuffer(content)) content = content.toString('utf8');

            return PATH.extname(this.path) === '.coffee'?
                this.__base(COFFEE.compile(content, { filename: this.path })) :
                this.__base.apply(this, arguments);

        }

    })

});
