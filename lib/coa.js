var PATH = require('path'),
    FS = require('fs'),
    U = require('./util');

module.exports = require('coa').Cmd()
    .name(process.argv[1])
    .title('Borschik. Extendable builder for text-based file formats.')
    .helpful()
    .opt()
        .name('version') .title('Version')
        .short('v').long('version')
        .flag()
        .only()
        .act(function() { return JSON.parse(FS.readFileSync(PATH.resolve(__dirname, '..', 'package.json'))).version })
        .end()
    .opt()
        .name('tech') .title('Technology')
        .short('t').long('tech')
        .end()
    .opt()
        // Give ability for external technologies to has its own options without conflicts with borschik
        .name('techOptions') .title('Additional options for tech in JSON format')
        .short('to').long('tech-options')
        .def("{}")
        .val(function(v) {
            return JSON.parse(v);
        })
        .end()
    .opt()
        .name('input').title('Input path')
        .short('i').long('input')
        .req()
        .end()
    .opt()
        .name('output').title('Output path')
        .short('o').long('output')
        .output()
        .req()
        .end()
    .opt()
        .name('freeze').title('Freeze links to static files (default: yes)')
        .short('f').long('freeze')
        .def(true)
        .val(function(v) {
            return U.stringToBoolean(v, true);
        })
        .end()
    .opt()
        .name('minimize').title('Minimize resulting content (default: yes)')
        .short('m').long('minimize')
        .def(true)
        .val(function(v) {
            return U.stringToBoolean(v, true);
        })
        .end()
    .opt()
        .name('comments').title('Wrap included files with comments (default: yes)')
        .short('c').long('comments')
        .def(true)
        .val(function(v) {
            return U.stringToBoolean(v, true);
        })
        .end()
    .opt()
        .name('warnings').title('Print warning about duplicates files (default: no)')
        .long('warnings')
        .def(false)
        .val(function(v) {
            return U.stringToBoolean(v, false);
        })
        .end()
    // borschik freeze
    .cmd()
        .name('freeze')
        .title('Freeze all files in dirs according to .borschik config')
        .helpful()
        .opt()
            .name('input').title('Input path (default: .).')
            .short('i').long('input')
            .def('.')
            .end()
        .opt()
            .name('output').title('Output path for resulting JSON')
            .short('o').long('output')
            .output()
            .end()
        .opt()
            .name('minimize').title('Minimize resulting JSON (default: yes)')
            .short('m').long('minimize')
            .def(true)
            .val(function(v) {
                return U.stringToBoolean(v, true);
            })
            .end()
        .act(function(opts) {
            var result = require('./freeze').freezeAll(opts.input);
            return U.writeFile(opts.output, opts.minimize? JSON.stringify(result) : JSON.stringify(result, null, 4));
        })
        .end()
    .act(function(opts) {
        var tech = opts.tech,
            input = opts.input;

        if (!tech && typeof input === 'string') {
            tech = PATH.extname(input).substr(1);
        }

        if (!tech || !tech.Tech) {
            tech = U.getTech(tech, true);
        }

        return new (tech.Tech)(opts)
            .process(opts.input, opts.output);

    });
