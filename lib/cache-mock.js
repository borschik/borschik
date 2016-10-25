var INHERIT = require('inherit');

function _inherit(d, s) {
    return INHERIT(this, d, s);
}

module.exports = INHERIT({
    __constructor: function() {},
    getParsedContent: function() {},
    putParsedContent: function() {}
}, {
    inherit: _inherit
});
