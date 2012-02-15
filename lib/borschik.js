var PATH = require('./path'),
    FS = require('fs');

module.exports = require('coa').Cmd()
    .name(process.argv[1])
    .title('Borschik. Extendable builder for text-based file formats.')
    .helpful()
    .opt()
        .name('version') .title('Version')
        .short('v').long('version')
        .flag()
        .only()
        .act(function() { return JSON.parse(FS.readFileSync(__dirname + '/../package.json')).version })
        .end()
    .opt()
        .name('tech') .title('Technology')
        .short('t').long('tech')
        .def(__dirname + '/tech.js')
        .val(function(t) {
            t = /^[^.][^\/]*$/g.test(t) ?
                __dirname + '/techs/' + t + '.js' :
                PATH.resolve(t);
            return new (require(t).Tech)() })
        .end()
    .opt()
        .name('input').title('Input path, required')
        .short('i').long('input')
        .req()
        .end()
    .opt()
        .name('output').title('Output path, required')
        .short('o').long('output')
        .output()
        .req()
        .end()
    .act(function(opts, args, res) {

        res || opts.tech
            .createFile(opts.input)
                .read()
                .write(opts.output)

    });
