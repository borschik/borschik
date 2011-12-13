var INHERIT = require('inherit'),
    base = require('../tech.js'),
    ometajs = require('./css.ometajs.js'),
    parser = ometajs.BorschikCSSParser,
    childs = ometajs.BorschikCSSChilds,
    translator = ometajs.BorschikCSSTranslator,

    Tech = exports.Tech = INHERIT(base.Tech, {
        File: INHERIT(base.File, {

            __constructor: function(tech, path, type, parent) {
                this.__base(tech, path, type, parent);
                this._childs = objectThatDelegatesTo(childs, { _file: this });
            },

            parseInclude: function(content) {
                return this._childs.childs(
                    this,
                    parser.parse(content))
            },

            processInclude: function(path) {
                return objectThatDelegatesTo(translator, { _path: path })
                    .translate(path, this.content)
            },

            processLink: function(path) {
                return JSON.stringify(this.pathFrom(path))
            }

        })
    });

// TODO: o_O
function objectThatDelegatesTo(x, props) {
    var f = function() {};
    f.prototype = x;
    var r = new f();
    for(var p in props)
        props.hasOwnProperty(p) &&
            (r[p] = props[p]);

    return r;
}
