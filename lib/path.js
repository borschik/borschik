var old = require('path');
for(var i in old) exports[i] = old[i];

exports.relative = function(from, to) {
    from = exports.resolve(from).split('/');
    to = exports.resolve(to).split('/');
    from.pop();
    while(from.length && to.length && to[0] == from[0]) {
        from.shift();
        to.shift();
    }
    while(from.shift()) to.unshift('..');
    return to.join('/');
};
