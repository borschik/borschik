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

class BaseNode {
    /**
     * @param {Any} item Content.
     * @param {String} path Source file path.
     * @param {String} [directive] Borschik's directive string (e.g. `'borschik:include:./foo.js'`).
     */
    constructor(item, path, directive) {
        this.item = item;
        this.path = path;
        this.directive = directive;
    }

    /**
     * @returns {Boolean}
     */
    hasChildren() {
        return false;
    }

    /**
     * @returns {String}
     */
    getContent() {
        return this.item;
    }

    /**
     * @returns {String[]}
     */
    getLines() {
        return this._lines || (this._lines = this.getContent().split(/\r?\n/));
    }

    /**
     * Whether node should be excluded from mappings.
     *
     * @returns {Boolean}
     */
    ignoreMappings() {
        return false;
    }
}

class StringNode extends BaseNode {};

class CommentNode extends StringNode {
    ignoreMappings() {
        return true;
    }
}

class LinkURLNode extends BaseNode{
    ignoreMappings() {
        return true;
    }
}

class IncludeNode extends BaseNode{
    hasChildren() {
        return true;
    }

    getContent() {
        if (this._serialized !== undefined) {
            return this._serialized;
        }

        var serialized = serializeItemList(this.item);
        if (this.commentsWrap) {
            serialized = commentsWrap(serialized, this.commentsWrap);
        }

        return this._serialized = serialized;
    }

    /**
     * @callback eachChildCallback
     * @param {BaseNode}
     * @param {Number|null}
     */
    /**
     * @param {eachChildCallback} fn
     */
    eachChild(fn) {
        if (this.commentsWrap) {
            fn(new CommentNode(commentsWrapBegin(this.commentsWrap), this.path));
        }

        if (!this.item.forEach) {
            console.log('this.item: ', this.item);
        }

        this.item.forEach(fn);

        if (this.commentsWrap) {
            fn(new CommentNode(commentsWrapEnd(this.commentsWrap), this.path));
        }
    }

    /**
     * @param {String} comment Will be used in the wrapping comments (with " begin" and " end" suffixes).
     */
    addCommentsWrap(comment) {
        this.commentsWrap = comment;
    }
}

class IncludeJSONNode extends BaseNode{
    getContent() {
        if (this._serialized !== undefined) {
            return this._serialized;
        }

        return this._serialized = JSON.stringify(serializeItemList(this.item));
    }
}

module.exports = {
    BaseNode: BaseNode,
    StringNode: StringNode,
    CommentNode: CommentNode,
    LinkURLNode: LinkURLNode,
    IncludeNode: IncludeNode,
    IncludeJSONNode: IncludeJSONNode
};
