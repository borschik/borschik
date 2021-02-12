/**
 * @fileOverview Borschik tech to freeze image links from json.
 */

const {Tech: BaseTech, File: BaseFile } = require('./css-base');

const additionalFreezeExtsRe = /\.(?:css|js|swf)$/;

class File extends BaseFile {
    parseInclude(content) {
        // prepare conent as text
        return content instanceof Buffer ? content.toString('utf-8') : content;
    }

    async processInclude(baseFile) {
        // parse json
        var entities = JSON.parse(this.content);

        for (var entity in entities) {
            var ent = entities[entity];
            // freeze images with cssBase.processLink
            const childFile = await this.child('linkUrl', this.pathTo(ent));
            const processed = await childFile.process(baseFile);
            entities[entity] = JSON.parse(processed);
        }

        // formatted output
        return JSON.stringify(entities, null, 4);
    }

    isFreezableUrl(url) {
        return super.isFreezableUrl(url) || additionalFreezeExtsRe.test(url);
    }
}

class JSONTech extends BaseTech {
    minimize(content) {
        // remove formating if minimize
        return JSON.stringify(JSON.parse(content));
    }

    File = File;
}

module.exports = {
    Tech: JSONTech,
    File
};
