var fs = require('fs');
var path = require('path');

var inherit = require('inherit');
var hashObj = require('hash-obj');
var assign = require('object-assign');
var mkdirp = require('mkdirp');

module.exports = inherit({
    __constructor: function(tmpDir) {
        this._tmpDir = tmpDir;
        this._cacheDir = path.join(this._tmpDir, 'cache');

        mkdirp.sync(this._cacheDir);
    },

    buildPath: function(filename, fileInfo) {
        var stats = fs.statSync(filename);
        var cacheData = assign({}, fileInfo || {}, {
            __path__: filename,
            __mtime__: stats.mtime
        });
        var key = hashObj(cacheData);

        return path.join(this._cacheDir, key);
    },

    _hasntChanges: function(filenames, mtimes) {
        return filenames.every(function (filenames) {
            try {
                var stats = fs.statSync(filename);
            } catch (err) {
                return false;
            }

            var oldDate = new Date(mtimes[filename]);

            return oldDate.getTime() === stats.mtime.getTime();
        });
    },

    getFile: function(filename, fileInfo) {
        try {
            var cachedPath = this.buildPath(filename, fileInfo);
            var str = fs.readFileSync(cachedPath, { encoding: 'utf-8' });
            var data = JSON.parse(str);

            if (this._hasntChanges(data.childrens, data.mtimes)) {
                return data.contents;
            }
        } catch (err) {
            if (err.code !== 'ENOENT') throw err;
        }
    },

    putFile: function(filename, contents, fileInfo, childrens) {
        try {
            var cachedPath = this.buildPath(filename, fileInfo);
            var mtimes = {};

            childrens.map(function(childPath) {
                try {
                    var stats = fs.statSync(filename);
                } catch (err) {}

                mtimes[childPath] = stats.mtime;
            });

            var data = {
                childrens: childrens,
                mtimes: mtimes,
                contents: contents
            };

            return fs.writeFileSync(cachedPath, JSON.stringify(data, null), { encoding: 'utf-8' });
        } catch (err) {
            if (err.code !== 'ENOENT') throw err;
        }
    }
});
