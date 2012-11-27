var PATH = require('path'),
    FS = require('./fs');

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
        .name('freeze').title('No freeze')
        .long('no-freeze')
        .def(true)
        .val(function(nf) {
            return nf? true : false;
        })
        .end()
    .opt()
        .name('minimize').title('No minimize')
        .long('no-minimize')
        .def(true)
        .val(function(nm) {
            return nm? true : false;
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
