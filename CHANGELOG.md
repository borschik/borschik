# 2.0.0

* Switch to `uglify-es` to support ES6 (@stochastical [#141]).

# 1.7.1

* Fixed path processing in Windows (@raulleo [#139]).

### Dependencies

* `uglify-js` updated to `2.8.29`
* `coa` updated to `1.0.3`
* `minimatch` updated to `3.0.4`
* `vow` updated to `0.4.16`

# 1.7.0

* Freeze hash function was moved to separate package [borschik-hash](https://github.com/borschik/borschik-hash) (@blond [#132]).
* Support for node 0.8.0 was dropped (@Yeti-or [#133]).

### Dependencies

* `csso` updated to `^3.0.0`.
* `uglify-js` updated to `2.8.14`.
* `minimatch` updated to `3.0.3`.
* `vow` updated to `0.4.15`.

# 1.6.1

### Bug fixes

* Fixed path processing in `css` tech (@blond [#124]).

[#124]: https://github.com/borschik/borschik/pull/124

### Dependencies

* `uglify-js` updated to `2.7.4`.
* `minimatch` updated to `3.0.3`.
* `coa` updated to `1.0.1`.
* `inherit` updated to `2.2.6`.
* `vow-fs` updated to `0.3.6`.

# 1.6.0

* `csso` updated to `2.0.0`.

# 1.5.3
 * Fix `enb-borschik` error processing [#112](https://github.com/borschik/borschik/pull/112)
 * `csso` update to 1.7.0 with a lot of fixes and speed improvements [#116](https://github.com/borschik/borschik/pull/116)
 * `uglify-js` updated to 2.6.2 [#113](https://github.com/borschik/borschik/pull/113), [#108](https://github.com/borschik/borschik/issues/108), [#106](https://github.com/borschik/borschik/issues/106)
 * UglifyJS has clear pretty error output. [#114](https://github.com/borschik/borschik/pull/114)
```
Error: Unexpected token: name (foo) (line: 7437, col: 12, pos: 312592)
  7435 |        };
  7436 |    } else {
  7437 |        let foo = 'bar';
--------------------^
  7438 |        result = {
  7439 |            result: 0
```

## 1.5.2
- `csso` updated to 1.5.4

## 1.5.1
- `uglify-js` updated to 2.6.1
- `csso` updated to 1.5.1

## 1.5.0
- `uglify-js` updated to 2.4.24
- `csso` updated to 1.4.2

## 1.4.0
- You can now freeze `.woff2`, `.js`, `.css` and `.cur` files.
- `vow-fs` was updated to `0.3.4`.

## 1.3.2
You can now freeze `.eot` files.

## 1.3.1
You can now freeze `.ico` files.

## 1.3.0
**New features**
 * Add support for [per directory freeze nesting level](https://github.com/borschik/borschik/blob/master/docs/freeze/freeze.en.md#setting-nesting-level-per-directory).

## 1.2.0
**New features**
 * borschik now supports `techOptions` as object in API [#72](https://github.com/borschik/borschik/pull/72)

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
 * borschik now supports input as string [#69](https://github.com/borschik/borschik/pull/69). Use `inputString` and `basePath` options in API

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
 * Better Windows support [#66](https://github.com/borschik/borschik/pull/66)
 * Better errors while freeze [#71](https://github.com/borschik/borschik/pull/71)

## 1.0.5

- Fix SVG filters inlining [#64](https://github.com/borschik/borschik/issues/64)

## 1.0.4

-  Add `encodeURI` inlining method [#62](https://github.com/borschik/borschik/issues/62)

## 1.0.3

-  Improve compatibility with LESS [#59](https://github.com/borschik/borschik/issues/59)

## 1.0.2

-  UglifyJS options support in JS tech.

```
$ borschik --input=myfile.js --tech-options='{"uglify":{"output":{"max_line_len": 100},"warnings":true}}'
```

## 1.0.1

-  Add support to use `borschik.link()` with node.js

## 1.0.0

- [SemVer](http://semver.org/) support
- [Add wildcard support for freeze_path](https://github.com/borschik/borschik/issues/23). This feature break compatibility:
  - path to freeze relative to config now (like `paths` or `follow_symlinks`)
  - path must be valid wildcard (paths like `./i/` must be replaced with `./i/**`)
- Add support for [freeze nesting path](https://github.com/borschik/borschik/pull/55). This options improve server performance for projects with a lot of freeze files.
- Add support for [custom tech options](https://github.com/borschik/borschik/pull/56).
- New `borschik.include()` [syntax for JS tech](https://github.com/borschik/borschik/pull/48).

## 0.4.2

- borschik can inline .jpg files now.
- Update dependencies: csso@1.3.10, uglify-js@2.4.6, vow@0.3.12

## 0.4.1

- borschik can inline .ttf files now.
- [Write bad result to output when minimize is failed](https://github.com/borschik/borschik/issues/28)

## 0.4.0
This version is partially incompatible with 0.3.x

- New plugin system. See [doc for details](https://github.com/borschik/borschik/blob/master/docs/where-is-my-tech/where-is-my-tech.en.md)
- [Resource inlining support](https://github.com/borschik/borschik/issues/9). See [doc for details](https://github.com/borschik/borschik/blob/master/docs/freeze/freeze.en.md#resource-inlining)
- [New js-include notations](https://github.com/borschik/borschik/issues/16). See [doc for details](https://github.com/borschik/borschik/blob/master/docs/js-include/js-include.en.md)
- Use [vow](https://github.com/dfilatov/jspromise) instead of [q](https://github.com/kriskowal/q) for promises
- Remove deprecated technologies: `css-fast` and `js-link`
- `json-links` tech renamed to `json`
- [OmetaJS](https://github.com/borschik/borschik-tech-css-ometajs) and [CoffeeScript](https://github.com/borschik/borschik-tech-js-coffee) techs moved from main repo to plugins
- Fix some issues with freeze in html tech ([#30](https://github.com/borschik/borschik/issues/30), [#39](https://github.com/borschik/borschik/issues/39))
- Update UglifyJS to 2.4.0

## 0.3.5
- Fix regression after https://github.com/borschik/borschik/issues/7

## 0.3.4
[Milestone 0.3.4](https://github.com/borschik/borschik/issues?milestone=3&state=closed)

- [Fix follow_symlinks behaviour](https://github.com/borschik/borschik/issues/7)
- [CSS tech now removes duplicates @import](https://github.com/borschik/borschik/issues/4)
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
