var ometajs_ = require('ometajs').globals || global;var StringBuffer = ometajs_.StringBuffer;
var objectThatDelegatesTo = ometajs_.objectThatDelegatesTo;
var isImmutable = ometajs_.isImmutable;
var digitValue = ometajs_.digitValue;
var isSequenceable = ometajs_.isSequenceable;
var escapeChar = ometajs_.escapeChar;
var unescape = ometajs_.unescape;
var getTag = ometajs_.getTag;
var inspect = ometajs_.inspect;
var lift = ometajs_.lift;
var clone = ometajs_.clone;
var Parser = ometajs_.Parser;
var fail = ometajs_.fail;
var OMeta = ometajs_.OMeta;
var BSNullOptimization = ometajs_.BSNullOptimization;
var BSAssociativeOptimization = ometajs_.BSAssociativeOptimization;
var BSSeqInliner = ometajs_.BSSeqInliner;
var BSJumpTableOptimization = ometajs_.BSJumpTableOptimization;
var BSOMetaOptimizer = ometajs_.BSOMetaOptimizer;
var BSOMetaParser = ometajs_.BSOMetaParser;
var BSOMetaTranslator = ometajs_.BSOMetaTranslator;
var BSJSParser = ometajs_.BSJSParser;
var BSSemActionParser = ometajs_.BSSemActionParser;
var BSJSIdentity = ometajs_.BSJSIdentity;
var BSJSTranslator = ometajs_.BSJSTranslator;
var BSOMetaJSParser = ometajs_.BSOMetaJSParser;
var BSOMetaJSTranslator = ometajs_.BSOMetaJSTranslator;
if (global === ometajs_) {
  fail = (function(fail) {
    return function() { return fail };
  })(fail);
  OMeta = require('ometajs').OMeta;
}{
    var cssptt = require("cssp/src/cssptt"), CSSParser = cssptt["CSSParser"], CSSTransformer = cssptt["CSSTransformer"], CSSTranslator = cssptt["CSSTranslator"];
    var BorschikCSSParser = exports.BorschikCSSParser = objectThatDelegatesTo(CSSParser, {});
    BorschikCSSParser["parse"] = function(content) {
        return this.matchAll(new String(content), "stylesheet");
    };
    var BorschikCSSChilds = exports.BorschikCSSChilds = objectThatDelegatesTo(CSSTransformer, {
        atrules: function() {
            var $elf = this, _fromIdx = this.input.idx, uri;
            return this._or(function() {
                return function() {
                    this._form(function() {
                        return function() {
                            this._applyWithArgs("exactly", "atrules");
                            this._form(function() {
                                return function() {
                                    this._applyWithArgs("exactly", "atkeyword");
                                    return this._form(function() {
                                        return function() {
                                            this._applyWithArgs("exactly", "ident");
                                            return this._applyWithArgs("exactly", "import");
                                        }.call(this);
                                    });
                                }.call(this);
                            });
                            this._apply("any");
                            return this._form(function() {
                                return function() {
                                    this._applyWithArgs("exactly", "uri");
                                    return this._form(function() {
                                        return function() {
                                            ((function() {
                                                switch (this._apply("anything")) {
                                                  case "string":
                                                    return "string";
                                                  case "raw":
                                                    return "raw";
                                                  default:
                                                    throw fail();
                                                }
                                            })).call(this);
                                            return uri = this._apply("anything");
                                        }.call(this);
                                    });
                                }.call(this);
                            });
                        }.call(this);
                    });
                    return [ "borschik", this["_file"].child("include", uri.replace(/["']/g, "")) ];
                }.call(this);
            }, function() {
                return CSSTransformer._superApplyWithArgs(this, "atrules");
            });
        },
        uri: function() {
            var $elf = this, _fromIdx = this.input.idx, uri;
            return this._or(function() {
                return function() {
                    this._form(function() {
                        return function() {
                            this._applyWithArgs("exactly", "uri");
                            return this._form(function() {
                                return function() {
                                    ((function() {
                                        switch (this._apply("anything")) {
                                          case "string":
                                            return "string";
                                          case "raw":
                                            return "raw";
                                          default:
                                            throw fail();
                                        }
                                    })).call(this);
                                    uri = this._apply("anything");
                                    return this._pred(!uri.replace(/["']/g, "").match(/^((\w+:)?\/\/|data\:)/));
                                }.call(this);
                            });
                        }.call(this);
                    });
                    return [ "uri", [ "borschik", this["_file"].child("link", uri.replace(/["']/g, "")) ] ];
                }.call(this);
            }, function() {
                return CSSTransformer._superApplyWithArgs(this, "uri");
            });
        },
        raw: function() {
            var $elf = this, _fromIdx = this.input.idx, c_, c;
            return this._or(function() {
                return function() {
                    this._form(function() {
                        return function() {
                            this._applyWithArgs("exactly", "raw");
                            return this._form(function() {
                                return function() {
                                    this._applyWithArgs("exactly", "p");
                                    this._applyWithArgs("exactly", "r");
                                    this._applyWithArgs("exactly", "o");
                                    this._applyWithArgs("exactly", "g");
                                    this._applyWithArgs("exactly", "i");
                                    this._applyWithArgs("exactly", "d");
                                    this._applyWithArgs("exactly", ":");
                                    this._applyWithArgs("exactly", "D");
                                    this._applyWithArgs("exactly", "X");
                                    this._applyWithArgs("exactly", "I");
                                    this._applyWithArgs("exactly", "m");
                                    this._applyWithArgs("exactly", "a");
                                    this._applyWithArgs("exactly", "g");
                                    this._applyWithArgs("exactly", "e");
                                    this._applyWithArgs("exactly", "T");
                                    this._applyWithArgs("exactly", "r");
                                    this._applyWithArgs("exactly", "a");
                                    this._applyWithArgs("exactly", "n");
                                    this._applyWithArgs("exactly", "s");
                                    this._applyWithArgs("exactly", "f");
                                    this._applyWithArgs("exactly", "o");
                                    this._applyWithArgs("exactly", "r");
                                    this._applyWithArgs("exactly", "m");
                                    this._applyWithArgs("exactly", ".");
                                    this._applyWithArgs("exactly", "M");
                                    this._applyWithArgs("exactly", "i");
                                    this._applyWithArgs("exactly", "c");
                                    this._applyWithArgs("exactly", "r");
                                    this._applyWithArgs("exactly", "o");
                                    this._applyWithArgs("exactly", "s");
                                    this._applyWithArgs("exactly", "o");
                                    this._applyWithArgs("exactly", "f");
                                    this._applyWithArgs("exactly", "t");
                                    this._applyWithArgs("exactly", ".");
                                    this._applyWithArgs("exactly", "A");
                                    this._applyWithArgs("exactly", "l");
                                    this._applyWithArgs("exactly", "p");
                                    this._applyWithArgs("exactly", "h");
                                    this._applyWithArgs("exactly", "a");
                                    this._applyWithArgs("exactly", "I");
                                    this._applyWithArgs("exactly", "m");
                                    this._applyWithArgs("exactly", "a");
                                    this._applyWithArgs("exactly", "g");
                                    this._applyWithArgs("exactly", "e");
                                    this._applyWithArgs("exactly", "L");
                                    this._applyWithArgs("exactly", "o");
                                    this._applyWithArgs("exactly", "a");
                                    this._applyWithArgs("exactly", "d");
                                    this._applyWithArgs("exactly", "e");
                                    this._applyWithArgs("exactly", "r");
                                    "progid:DXImageTransform.Microsoft.AlphaImageLoader";
                                    this._applyWithArgs("exactly", "(");
                                    c_ = this._consumedBy(function() {
                                        return this._many1(function() {
                                            return function() {
                                                this._not(function() {
                                                    return this._applyWithArgs("exactly", ")");
                                                });
                                                return this._apply("char");
                                            }.call(this);
                                        });
                                    });
                                    c = this._applyWithArgs("AlphaImageLoaderAttrs", c_);
                                    return this._applyWithArgs("exactly", ")");
                                }.call(this);
                            });
                        }.call(this);
                    });
                    return [ "AlphaImageLoader", c ];
                }.call(this);
            }, function() {
                return CSSTransformer._superApplyWithArgs(this, "raw");
            });
        },
        AlphaImageLoaderAttrs: function() {
            var $elf = this, _fromIdx = this.input.idx, c;
            return function() {
                this._form(function() {
                    return c = this._applyWithArgs("listOf", "AlphaImageLoaderAttr", ",");
                });
                return [ "AlphaImageLoaderAttrs", c ];
            }.call(this);
        },
        AlphaImageLoaderAttr: function() {
            var $elf = this, _fromIdx = this.input.idx, n, v, n, v;
            return this._or(function() {
                return function() {
                    n = function() {
                        this._applyWithArgs("exactly", "s");
                        this._applyWithArgs("exactly", "r");
                        this._applyWithArgs("exactly", "c");
                        return "src";
                    }.call(this);
                    this._applyWithArgs("exactly", "=");
                    v = this._consumedBy(function() {
                        return this._many1(function() {
                            return function() {
                                this._not(function() {
                                    return this._applyWithArgs("exactly", ",");
                                });
                                return this._apply("char");
                            }.call(this);
                        });
                    });
                    return [ "AlphaImageLoaderAttr", n, [ "borschik", this["_file"].child("link", v.replace(/["']/g, "")) ] ];
                }.call(this);
            }, function() {
                return function() {
                    n = this._consumedBy(function() {
                        return this._many1(function() {
                            return this._apply("letter");
                        });
                    });
                    this._applyWithArgs("exactly", "=");
                    v = this._consumedBy(function() {
                        return this._many1(function() {
                            return function() {
                                this._not(function() {
                                    return this._applyWithArgs("exactly", ",");
                                });
                                return this._apply("char");
                            }.call(this);
                        });
                    });
                    return [ "AlphaImageLoaderAttr", n, [ "raw", v ] ];
                }.call(this);
            });
        }
    });
    BorschikCSSChilds["childs"] = function(file, content) {
        return this.match(content, "stylesheet");
    };
    var BorschikCSSTranslator = exports.BorschikCSSTranslator = objectThatDelegatesTo(CSSTranslator, {
        any: function() {
            var $elf = this, _fromIdx = this.input.idx;
            return this._or(function() {
                return this._apply("borschik");
            }, function() {
                return this._apply("AlphaImageLoader");
            }, function() {
                return CSSTranslator._superApplyWithArgs(this, "any");
            });
        },
        borschik: function() {
            var $elf = this, _fromIdx = this.input.idx, f;
            return function() {
                this._form(function() {
                    return function() {
                        this._applyWithArgs("exactly", "borschik");
                        return f = this._apply("anything");
                    }.call(this);
                });
                return f.process(this["_path"]);
            }.call(this);
        },
        AlphaImageLoader: function() {
            var $elf = this, _fromIdx = this.input.idx, c;
            return function() {
                this._form(function() {
                    return function() {
                        this._applyWithArgs("exactly", "AlphaImageLoader");
                        return c = this._apply("AlphaImageLoaderAttrs");
                    }.call(this);
                });
                return "progid:DXImageTransform.Microsoft.AlphaImageLoader(" + c + ")";
            }.call(this);
        },
        AlphaImageLoaderAttrs: function() {
            var $elf = this, _fromIdx = this.input.idx, as;
            return function() {
                this._form(function() {
                    return function() {
                        this._applyWithArgs("exactly", "AlphaImageLoaderAttrs");
                        return this._form(function() {
                            return as = this._many1(function() {
                                return this._apply("AlphaImageLoaderAttr");
                            });
                        });
                    }.call(this);
                });
                return as.join(",");
            }.call(this);
        },
        AlphaImageLoaderAttr: function() {
            var $elf = this, _fromIdx = this.input.idx, n, v;
            return function() {
                this._form(function() {
                    return function() {
                        this._applyWithArgs("exactly", "AlphaImageLoaderAttr");
                        n = this._apply("anything");
                        return v = this._apply("any");
                    }.call(this);
                });
                return n + "=" + v;
            }.call(this);
        }
    });
    BorschikCSSTranslator["translate"] = function(path, content) {
        return this.match(content, "stylesheet");
    };
}