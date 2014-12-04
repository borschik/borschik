# How borschik resolves technologies

`borschik` resolves a technology path in the following order

1. If the path starts with `/` or `.`, `borschik` uses the given path. For example, `borschik -t ./my-tech/tech.js -i my-file.ext`.
2. Tries to load the technology from `borschik/lib/techs/<given technology>`. For example, `borschik -t css -i my-file.css`.
3. If no, tries to load `borschik-tech-<given technology>` npm package. The example loads `borschik-tech-js-coffee` npm package: `borschik -t js-coffee -i my-file.coffee`.
