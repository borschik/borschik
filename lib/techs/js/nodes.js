var inherit = require('inherit');

function _inherit(d, s) {
    return inherit(this, d, s);
}

function commentsWrapBegin(section) {
    return '/* ' + section + ' begin */\n';
}

function commentsWrapEnd(section) {
    return '\n/* ' + section + ' end */\n';
}

function commentsWrap(content, section) {
    return commentsWrapBegin(section) + content + commentsWrapEnd(section);
}

function serializeItemList(items) {
    return items
        .map(function(x) { return x.getContent() })
        .join('');
}

var BaseNode = inherit({
    /**
     * @param {Any} item Content.
     * @param {String} path Source file path.
     * @param {String} [directive] Borschik's directive string (e.g. `'borschik:include:./foo.js'`).
     */
    __constructor: function(item, path, directive) {
        this.item = item;
        this.path = path;
        this.directive = directive;
    },

    /**
     * @returns {Boolean}
     */
    hasChildren: function() {
        return false;
    },

    /**
     * @returns {String}
     */
    getContent: function() {
        return this.item;
    },

    /**
     * @returns {String[]}
     */
    getLines: function() {
        return this._lines || (this._lines = this.getContent().split(/\r?\n/));
    },

    /**
     * Whether node should be excluded from mappings.
     *
     * @returns {Boolean}
     */
    ignoreMappings: function() {
        return false;
    }
}, {
    inherit: _inherit
});

var StringNode = BaseNode.inherit();

var CommentNode = StringNode.inherit({
    ignoreMappings: function() {
        return true;
    }
});

var LinkURLNode = BaseNode.inherit({
    ignoreMappings: function() {
        return true;
    }
});

var IncludeNode = BaseNode.inherit({
    hasChildren: function() {
        return true;
    },

    getContent: function() {
        if (this._serialized !== undefined) {
            return this._serialized;
        }

        var serialized = serializeItemList(this.item);
        if (this.commentsWrap) {
            serialized = commentsWrap(serialized, this.commentsWrap);
        }

        return this._serialized = serialized;
    },

    /**
     * @callback eachChildCallback
     * @param {BaseNode}
     * @param {Number|null}
     */
    /**
     * @param {eachChildCallback} fn
     */
    eachChild: function(fn) {
        if (this.commentsWrap) {
            fn(new CommentNode(commentsWrapBegin(this.commentsWrap), this.path));
        }

        this.item.forEach(fn);

        if (this.commentsWrap) {
            fn(new CommentNode(commentsWrapEnd(this.commentsWrap), this.path));
        }
    },

    /**
     * @param {String} comment Will be used in the wrapping comments (with " begin" and " end" suffixes).
     */
    addCommentsWrap: function(comment) {
        this.commentsWrap = comment;
    }
});

var IncludeJSONNode = BaseNode.inherit({
    getContent: function() {
        if (this._serialized !== undefined) {
            return this._serialized;
        }

        return this._serialized = JSON.stringify(serializeItemList(this.item));
    }
});

module.exports = {
    BaseNode: BaseNode,
    StringNode: StringNode,
    LinkURLNode: LinkURLNode,
    IncludeNode: IncludeNode,
    IncludeJSONNode: IncludeJSONNode
};
