'use strict';

module.exports = {
    /**
     * Create error message with explanation
     *
     * @example
     * ```
     * Error: Unexpected token: name (foo) (line: 7437, col: 12, pos: 312592)
     * 7435 |        };
     * 7436 |    } else {
     * 7437 |        let foo = 'bar';
     * --------------------^
     * 7438 |        result = {
     * 7439 |            result: 0
     * ```
     *
     * @param lines
     * @param error
     */
    explain: function(lines, error) {
        var lineNumber = error.line - 1;
        var result = [
            renderLine(lineNumber, lines[lineNumber]),
            renderPointer(error.col)
        ];
        var i = lineNumber - 1;
        var linesAround = 2;
        while (i >= 0 && i >= (lineNumber - linesAround)) {
            result.unshift(renderLine(i, lines[i]));
            i--;
        }
        i = lineNumber + 1;
        while (i < lines.length && i <= (lineNumber + linesAround)) {
            result.push(renderLine(i, lines[i]));
            i++;
        }
        result.unshift(error.message + " (line: " + error.line + ", col: " + error.col + ", pos: " + error.pos + ")");
        return result.join('\n');

    }
};

// Thanks to jscs for these functions :)

/**
 * Renders single line of code in style error formatted output.
 *
 * @param {Number} n line number
 * @param {String} line
 * @returns {String}
 */
function renderLine(n, line) {
    // Convert tabs to spaces, so errors in code lines with tabs as indention symbol
    // could be correctly rendered, plus it will provide less verbose output
    line = line.replace(/\t/g, ' ');

    // "n + 1" to print lines in human way (counted from 1)
    var lineNumber = prependSpaces((n + 1).toString(), 5) + ' |';
    return ' ' + lineNumber + line;
}

/**
 * Renders pointer:
 * ---------------^
 *
 * @param {Number} column
 * @returns {String}
 */
function renderPointer(column) {
    return (new Array(column + 9)).join('-') + '^';
}

/**
 * Simple util for prepending spaces to the string until it fits specified size.
 *
 * @param {String} s
 * @param {Number} len
 * @returns {String}
 */
function prependSpaces(s, len) {
    while (s.length < len) {
        s = ' ' + s;
    }
    return s;
}
