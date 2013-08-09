## 0.4.0
This version is partially incompatible with 0.3.x

- Use [vow](https://github.com/dfilatov/jspromise) instead of [q](https://github.com/kriskowal/q) for promises.
- Remove deprecated technologies: `css-fast` and `js-link`
- `json-links` tech renamed to `json`
- OmetaJS and CoffeeScript techs moved from main repo to plugins (links here)
- [Resource inlining support](https://github.com/bem/borschik/issues/9). See [doc for details](./docs/freeze/freeze.en.md#resource-inlining)
- [New js-include notations](https://github.com/bem/borschik/issues/16). See [doc for details](./docs/js-include/js-include.en.md)

## 0.3.5 (July 30, 2013)
- Fix regression after https://github.com/bem/borschik/issues/7

## 0.3.4 (July 29, 2013)
[Milestone 0.3.4](https://github.com/bem/borschik/issues?milestone=3&state=closed)

- [Fix follow_symlinks behaviour](https://github.com/bem/borschik/issues/7)
- [CSS tech now removes duplicates @import](https://github.com/bem/borschik/issues/4)
- Update documentation for English and Russian

## 0.3.3 (July 18, 2013)
Update dependencies versions

- coa ~0.4.0
- inherit ~1.0.4
- q ~0.9.5
- ometajs ~3.2.4
- uglify-js ~2.3.6
- istanbul ~0.1.42
- mocha ~1.12.0

## 0.3.2 (July 06, 2013)
- UglifyJS updated to ~2.3
- CSSO updated to 1.3.7
- Fix problem with freeze and mkdir (https://github.com/veged/borschik/issues/90)
- Merge `js` and `js-link` techs. `js-link` is deprecated and will be deleted soon

## 0.3.1
- fix some Windows issues
