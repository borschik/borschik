/**
 * @fileOverview Borschik methods for freezed images to use is JS.
 * You must include this file to your JS for browser.
 */

(function() {
    /**
     * Borschik
     * @namespace
     */
    var borschik = window['borschik'] = {};

    var links = {};

    /**
     * Add links from "tech/freeze-links".
     * @param {object} json
     */
    borschik.addLinks = function(json) {
        for (var link in json) {
            links[link] = json[link];
        }
    };

    /**
     * Return link by name.
     * @param {string} link
     * @returns {string}
     */
    borschik.link = function(link) {
        // link with "@" is dynamic
        if (link.charAt(0) === '@') {
            return links[link.substr(1)];
        }

        return link;
    };

})();
