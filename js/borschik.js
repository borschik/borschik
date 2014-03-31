/**
 * @fileOverview Borschik object to use in browser.
 */

(function() {

    /**
     * Borschik
     * @namespace
     */
    var borschik = {};

    /**
     * Storage for dynamic links.
     * @private
     * @type {Object}
     */
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
            return links[link.substr(1)] || '[borschik] Undefined link "' + link + '"';
        }

        return link;
    };

    // exports namespace
    if (typeof window === 'undefined' && typeof module !== 'undefined') {
        module.exports = borschik;
    } else {
        window['borschik'] = borschik;
    }

})();
