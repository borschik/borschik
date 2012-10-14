var INHERIT = require('inherit'),
    util = require('util'),
    base = require('../tech'),
    ometajs = require('./css.ometajs.js'),
    parser = ometajs.BorschikCSSParser,
    children = ometajs.BorschikCSSChildren,
    translator = ometajs.BorschikCSSTranslator;

function correctInherit(derived, base) {
  util.inherits(derived, base);

  // Copy all static methods and properties
  Object.keys(base).forEach(function(key) {
    if (!base.hasOwnProperty(key)) return;
    derived[key] = base[key];
  });

  return derived;
};

exports.Tech = INHERIT(base.Tech, {
    File: INHERIT(base.File, {

        __constructor: function(tech, path, type, parent) {
            var file = this;

            this.__base(tech, path, type, parent);

            function SpecificChildren(source) {
                children.call(this, source);
                this._file = file;
            };
            this._children = correctInherit(SpecificChildren, children);
        },

        parseInclude: function(content) {
            return this._children.children(
                this,
                parser.parse(content))
        },

        processInclude: function(path) {
          function SpecificTranslator(source) {
              translator.call(this, source);
              this._path = path;
          };
          return correctInherit(SpecificTranslator, translator)
              .translate(path, this.content);
        },

        processLink: function(path) {
            return JSON.stringify(this.pathFrom(path))
        },

        processPath: function(path) {
            return path.replace(/^(.*?)(\?|$)/, '$1');
        }

    })
});
