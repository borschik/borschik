exports.main = function () {
    require('coa').Cmd()
        .name(process.argv[1])
        .title('Borschik. Extendable builder for text-based file formats.')
        .helpful()
        .opt()
            .name('version').short('v').long('version')
            .title('Version')
            .type(Boolean)
            .end()
        .act(function(opts) {
            opts.version &&
                this.exit(
                    JSON.parse(require('fs').readFileSync(__dirname + '/../package.json'))
                        .version);
        })
        .parse(process.argv.slice(2));
};
