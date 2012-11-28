var PATH = require('path'),
    FS = require('./fs'),
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
        .def(PATH.join(__dirname, 'tech.js'))
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
    .act(function(opts, args, res) {

        var t = opts.tech;

        t = PATH.basename(t) === t ?
                PATH.join(__dirname, 'techs', t + '.js') :
                PATH.resolve(t);

        return new (require(t).Tech)(opts)
            .process(opts.input, opts.output);

    });
