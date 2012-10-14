var ometajs_ = require("ometajs");

var AbstractGrammar = ometajs_.grammars.AbstractGrammar;

var BSJSParser = ometajs_.grammars.BSJSParser;

var BSJSIdentity = ometajs_.grammars.BSJSIdentity;

var BSJSTranslator = ometajs_.grammars.BSJSTranslator;

var cssptt = require("cssp/src/cssptt"), CSSParser = cssptt.CSSParser, CSSTransformer = cssptt.CSSTransformer, CSSTranslator = cssptt.CSSTranslator;

var BorschikCSSParser = function BorschikCSSParser(source) {
    CSSParser.call(this, source);
};

BorschikCSSParser.grammarName = "BorschikCSSParser";

BorschikCSSParser.match = CSSParser.match;

BorschikCSSParser.matchAll = CSSParser.matchAll;

exports.BorschikCSSParser = BorschikCSSParser;

require("util").inherits(BorschikCSSParser, CSSParser);

BorschikCSSParser.parse = function(content) {
    return this.matchAll(String(content), "stylesheet");
};

var BorschikCSSChildren = function BorschikCSSChildren(source) {
    CSSTransformer.call(this, source);
};

BorschikCSSChildren.grammarName = "BorschikCSSChildren";

BorschikCSSChildren.match = CSSTransformer.match;

BorschikCSSChildren.matchAll = CSSTransformer.matchAll;

exports.BorschikCSSChildren = BorschikCSSChildren;

require("util").inherits(BorschikCSSChildren, CSSTransformer);

BorschikCSSChildren.prototype["atrules"] = function $atrules() {
    return this._atomic(function() {
        var uri;
        return this._list(function() {
            return this._match("atrules") && this._list(function() {
                return this._match("atkeyword") && this._list(function() {
                    return this._match("ident") && this._match("import");
                });
            }) && this._rule("any", false, [], null, this["any"]) && this._list(function() {
                return this._match("uri") && this._list(function() {
                    return (this._match("string") || this._match("raw")) && this._skip() && (uri = this._getIntermediate(), true);
                });
            });
        }) && this._exec([ "borschik", this._file.child("include", uri.replace(/["']/g, "")) ]);
    }) || this._atomic(function() {
        return this._rule("atrules", false, [], CSSTransformer, CSSTransformer.prototype["atrules"]);
    });
};

BorschikCSSChildren.prototype["uri"] = function $uri() {
    return this._atomic(function() {
        var uri;
        return this._list(function() {
            return this._match("uri") && this._list(function() {
                return (this._match("string") || this._match("raw")) && this._skip() && (uri = this._getIntermediate(), true) && !uri.replace(/["']/g, "").match(/^((\w+:)?\/\/|data\:)/);
            });
        }) && this._exec([ "uri", [ "borschik", this._file.child("link", uri.replace(/["']/g, "")) ] ]);
    }) || this._atomic(function() {
        return this._rule("uri", false, [], CSSTransformer, CSSTransformer.prototype["uri"]);
    });
};

BorschikCSSChildren.prototype["raw"] = function $raw() {
    return this._atomic(function() {
        var c_, c;
        return this._list(function() {
            return this._match("raw") && this._list(function() {
                return this._seq("progid:DXImageTransform.Microsoft.AlphaImageLoader") && this._match("(") && this._list(function() {
                    return this._many(function() {
                        return this._atomic(function() {
                            return !this._atomic(function() {
                                return this._match(")");
                            }, true) && this._rule("char", false, [], null, this["char"]);
                        });
                    });
                }, true) && (c_ = this._getIntermediate(), true) && this._rule("AlphaImageLoaderAttrs", false, [ c_ ], null, this["AlphaImageLoaderAttrs"]) && (c = this._getIntermediate(), true) && this._match(")");
            });
        }) && this._exec([ "AlphaImageLoader", c ]);
    }) || this._atomic(function() {
        return this._rule("raw", false, [], CSSTransformer, CSSTransformer.prototype["raw"]);
    });
};

BorschikCSSChildren.prototype["AlphaImageLoaderAttrs"] = function $AlphaImageLoaderAttrs() {
    var c;
    return this._list(function() {
        return this._rule("listOf", false, [ "AlphaImageLoaderAttr", "," ], null, this["listOf"]) && (c = this._getIntermediate(), true);
    }) && this._exec([ "AlphaImageLoaderAttrs", c ]);
};

BorschikCSSChildren.prototype["AlphaImageLoaderAttr"] = function $AlphaImageLoaderAttr() {
    return this._atomic(function() {
        var n, v;
        return this._seq("src") && (n = this._getIntermediate(), true) && this._match("=") && this._list(function() {
            return this._many(function() {
                return this._atomic(function() {
                    return !this._atomic(function() {
                        return this._match(",");
                    }, true) && this._rule("char", false, [], null, this["char"]);
                });
            });
        }, true) && (v = this._getIntermediate(), true) && this._exec([ "AlphaImageLoaderAttr", n, [ "borschik", this._file.child("link", v.replace(/["']/g, "")) ] ]);
    }) || this._atomic(function() {
        var n, v;
        return this._list(function() {
            return this._many(function() {
                return this._atomic(function() {
                    return this._rule("letter", false, [], null, this["letter"]);
                });
            });
        }, true) && (n = this._getIntermediate(), true) && this._match("=") && this._list(function() {
            return this._many(function() {
                return this._atomic(function() {
                    return !this._atomic(function() {
                        return this._match(",");
                    }, true) && this._rule("char", false, [], null, this["char"]);
                });
            });
        }, true) && (v = this._getIntermediate(), true) && this._exec([ "AlphaImageLoaderAttr", n, [ "raw", v ] ]);
    });
};

BorschikCSSChildren.children = function children(file, content) {
    return this.match(content, "stylesheet");
};

var BorschikCSSTranslator = function BorschikCSSTranslator(source) {
    CSSTranslator.call(this, source);
};

BorschikCSSTranslator.grammarName = "BorschikCSSTranslator";

BorschikCSSTranslator.match = CSSTranslator.match;

BorschikCSSTranslator.matchAll = CSSTranslator.matchAll;

exports.BorschikCSSTranslator = BorschikCSSTranslator;

require("util").inherits(BorschikCSSTranslator, CSSTranslator);

BorschikCSSTranslator.prototype["any"] = function $any() {
    return this._atomic(function() {
        return this._rule("borschik", false, [], null, this["borschik"]);
    }) || this._atomic(function() {
        return this._rule("AlphaImageLoader", false, [], null, this["AlphaImageLoader"]);
    }) || this._atomic(function() {
        return this._rule("any", false, [], CSSTranslator, CSSTranslator.prototype["any"]);
    });
};

BorschikCSSTranslator.prototype["borschik"] = function $borschik() {
    var f;
    return this._list(function() {
        return this._match("borschik") && this._skip() && (f = this._getIntermediate(), true);
    }) && this._exec(f.process(this._path));
};

BorschikCSSTranslator.prototype["AlphaImageLoader"] = function $AlphaImageLoader() {
    var c;
    return this._list(function() {
        return this._match("AlphaImageLoader") && this._rule("AlphaImageLoaderAttrs", false, [], null, this["AlphaImageLoaderAttrs"]) && (c = this._getIntermediate(), true);
    }) && this._exec("progid:DXImageTransform.Microsoft.AlphaImageLoader(" + c + ")");
};

BorschikCSSTranslator.prototype["AlphaImageLoaderAttrs"] = function $AlphaImageLoaderAttrs() {
    var as;
    return this._list(function() {
        return this._match("AlphaImageLoaderAttrs") && this._list(function() {
            return this._many(function() {
                return this._atomic(function() {
                    return this._rule("AlphaImageLoaderAttr", false, [], null, this["AlphaImageLoaderAttr"]);
                });
            }) && (as = this._getIntermediate(), true);
        });
    }) && this._exec(as.join(","));
};

BorschikCSSTranslator.prototype["AlphaImageLoaderAttr"] = function $AlphaImageLoaderAttr() {
    var n, v;
    return this._list(function() {
        return this._match("AlphaImageLoaderAttr") && this._skip() && (n = this._getIntermediate(), true) && this._rule("any", false, [], null, this["any"]) && (v = this._getIntermediate(), true);
    }) && this._exec(n + "=" + v);
};

BorschikCSSTranslator.translate = function(path, content) {
    return this.match(content, "stylesheet");
};