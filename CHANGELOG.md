## 1.4.0
- You can now freeze `.woff2`, `.js`, `.css` and `.cur` files.
- `vow-fs` was updated to `0.3.4`.

## 1.3.2
You can now freeze `.eot` files.

## 1.3.1
You can now freeze `.ico` files.

## 1.3.0
**New features**
 * Add support for [per directory freeze nesting level](https://github.com/bem/borschik/blob/master/docs/freeze/freeze.en.md#setting-nesting-level-per-directory).

## 1.2.0
**New features**
 * borschik now supports `techOptions` as object in API [#72](https://github.com/bem/borschik/pull/72)

```js
// old API (also supported)
borschik.api({
    techOptions: '{ "uglify": { "warnings": true } }'    
});

// new API
borschik.api({
    techOptions: {
        uglify: {
            warnings: true
        }    
    }
});
```

## 1.1.0
**New features**
 * borschik now supports input as string [#69](https://github.com/bem/borschik/pull/69). Use `inputString` and `basePath` options in API

```
borschik.api({
    basePath: '.',
    inputString: 'var a = 1;',
    tech: 'js'
}).then(function(result) {

}, function(error) {

});
```

**Fixes**
 * Better Windows support [#66](https://github.com/bem/borschik/pull/66)
 * Better errors while freeze [#71](https://github.com/bem/borschik/pull/71)

## 1.0.5

- Fix SVG filters inlining [#64](https://github.com/bem/borschik/issues/64)

## 1.0.4

-  Add `encodeURI` inlining method [#62](https://github.com/bem/borschik/issues/62)

## 1.0.3

-  Improve compatibility with LESS [#59](https://github.com/bem/borschik/issues/59)

## 1.0.2

-  UglifyJS options support in JS tech.

```
$ borschik --input=myfile.js --tech-options='{"uglify":{"output":{"max_line_len": 100},"warnings":true}}'
```

## 1.0.1

-  Add support to use `borschik.link()` with node.js

## 1.0.0

- [SemVer](http://semver.org/) support
- [Add wildcard support for freeze_path](https://github.com/bem/borschik/issues/23). This feature break compatibility:
  - path to freeze relative to config now (like `paths` or `follow_symlinks`)
  - path must be valid wildcard (paths like `./i/` must be replaced with `./i/**`)
- Add support for [freeze nesting path](https://github.com/bem/borschik/pull/55). This options improve server performance for projects with a lot of freeze files.
- Add support for [custom tech options](https://github.com/bem/borschik/pull/56).
- New `borschik.include()` [syntax for JS tech](https://github.com/bem/borschik/pull/48).

## 0.4.2

- borschik can inline .jpg files now.
- Update dependencies: csso@1.3.10, uglify-js@2.4.6, vow@0.3.12

## 0.4.1

- borschik can inline .ttf files now.
- [Write bad result to output when minimize is failed](https://github.com/bem/borschik/issues/28)

## 0.4.0
This version is partially incompatible with 0.3.x

- New plugin system. See [doc for details](https://github.com/bem/borschik/blob/master/docs/where-is-my-tech/where-is-my-tech.en.md)
- [Resource inlining support](https://github.com/bem/borschik/issues/9). See [doc for details](https://github.com/bem/borschik/blob/master/docs/freeze/freeze.en.md#resource-inlining)
- [New js-include notations](https://github.com/bem/borschik/issues/16). See [doc for details](https://github.com/bem/borschik/blob/master/docs/js-include/js-include.en.md)
- Use [vow](https://github.com/dfilatov/jspromise) instead of [q](https://github.com/kriskowal/q) for promises
- Remove deprecated technologies: `css-fast` and `js-link`
- `json-links` tech renamed to `json`
- [OmetaJS](https://github.com/bem/borschik-tech-css-ometajs) and [CoffeeScript](https://github.com/bem/borschik-tech-js-coffee) techs moved from main repo to plugins
- Fix some issues with freeze in html tech ([#30](https://github.com/bem/borschik/issues/30), [#39](https://github.com/bem/borschik/issues/39))
- Update UglifyJS to 2.4.0

## 0.3.5
- Fix regression after https://github.com/bem/borschik/issues/7

## 0.3.4
[Milestone 0.3.4](https://github.com/bem/borschik/issues?milestone=3&state=closed)

- [Fix follow_symlinks behaviour](https://github.com/bem/borschik/issues/7)
- [CSS tech now removes duplicates @import](https://github.com/bem/borschik/issues/4)
- Update documentation for English and Russian

## 0.3.3
Update dependencies versions

- coa ~0.4.0
- inherit ~1.0.4
- q ~0.9.5
- ometajs ~3.2.4
- uglify-js ~2.3.6
- istanbul ~0.1.42
- mocha ~1.12.0

## 0.3.2
- UglifyJS updated to ~2.3
- CSSO updated to 1.3.7
- Fix problem with freeze and mkdir (https://github.com/veged/borschik/issues/90)
- Merge `js` and `js-link` techs. `js-link` is deprecated and will be deleted soon

## 0.3.1
- fix some Windows issues
