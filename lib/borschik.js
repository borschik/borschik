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
        .name('noFreeze').title('No freeze')
        .long('no-freeze')
        .flag()
        .end()
    .opt()
        .name('noMinimize').title('No minimize')
        .long('no-minimize')
        .flag()
        .end()
    .act(function(opts, args, res) {
        var t = opts.tech;

        if (typeof opts.freeze === 'undefined') {
            opts.freeze = !opts.noFreeze;
            delete opts.noFreeze;
        }

        if (typeof opts.minimize === 'undefined') {
            opts.minimize = !opts.noMinimize;
            delete opts.noMinimize;
        }

        t = PATH.basename(t) === t ?
                PATH.join(__dirname, 'techs', t + '.js') :
                PATH.resolve(t);

        return new (require(t).Tech)(opts)
            .process(opts.input, opts.output);
    });
