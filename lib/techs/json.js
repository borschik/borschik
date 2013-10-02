/**
 * @fileOverview Borschik tech to freeze image links from json.
 */

var CSSBASE = require('./css-base');

const additionalFreezeExtsRe = /\.(?:css|js|swf)$/;

exports.Tech = CSSBASE.Tech.inherit({

    minimize: function(content) {
        // remove formating if minimize
        return JSON.stringify(JSON.parse(content));
    },

    File: exports.File = CSSBASE.File.inherit({

        parseInclude: function(content) {
            // prepare conent as text
            return content instanceof Buffer ? content.toString('utf-8') : content;
        },

        processInclude: function(baseFile) {
            // parse json
            var entities = JSON.parse(this.content);

            for (var entity in entities) {
                var ent = entities[entity];
                // freeze images with cssBase.processLink
                entities[entity] = JSON.parse(this.child('linkUrl', this.pathTo(ent)).process(baseFile));
            }

            // formatted output
            return JSON.stringify(entities, null, 4);
        },

        isFreezableUrl: function(url) {
            return this.__base(url) || additionalFreezeExtsRe.test(url);
        }
    })
});
