# Static resources ”freeze“

What means ”freeze“: description and advantages of this technology you can get in [article at bem.info](http://bem.info/articles/borschik).

## `.borschik` config

At first we need a config. It is located in `.borschik` file.

`.borschik` file relates to its own directory and all subdirectories.

```js
{
    "freeze_paths": {
        "i/bg/**": "freeze/bg",
        "i/ico/**": "freeze/ico"
    }
}
```

`freeze_paths` – a key that defines which files will be frozen, and where the transformation results of these pathes will be stored.

For example, when borschik processes CSS files and finds links to images in `/i/bg` directory,
borschik freezes these links, changes their pathes to `freeze/bg`, and creates the image copies in `freeze/bg` directory.

An object key – a wildcard whose files will be frozen. Wildcards are matched with [minimatch](https://github.com/isaacs/minimatch).
A key value – a directory for resulting the frozen files, relative to the config path.

Other example
```js
{
    "freeze_paths": {
        "i/bg/**": "i/_"
    }
}
```
borschik freezes matched files from directory `i/bg` to `i/_`

**Important note**
* borschik does not freeze all files in directories but only those linked by processed files.
* borschik creates a copy of original files in freeze dir whose filename is a checksum of the file content.

## Resource inlining
There is special syntax (`:encodeURI:`, `:encodeURIComponent:` and `:base64:`) for resource inlining.

```json
{
    "freeze_paths": {
        "i/svg_images/**": ":encodeURIComponent:",
        "i/gif_images/**": ":base64:"
    }
}
```

With this config all links to resources in `i/svg_images` or `i/gif_images` will be inlined.

borschik supports `base64`, `encodeURI`, and `encodeURIComponent` encoding only.

borschik supports the following file formats: gif, png, svg, woff.

Example
```css
.gif {
    background: url("i/gif_images/icon.gif");
}
.svg {
    background: url("i/svg_images/image.svg");
}
```

Result
```css
.gif {
    background: url("data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==");
}
.svg {
    background: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org.......");
}
```

Inlining in JS files with `borschik.link()` is also supported.

## nesting level
```json
{
    "freeze_paths": {
        "i/bg/**": "freeze",
        "i/ico/**": "freeze"
    },

    "freeze_nesting_level": 2
}
```

Nesting level is used to improve server performance for projects with a lot of freezed files.

Servers have the problem to read directory listing with more then 1000 files and developers ussualy split such dirs.

Some examples

Dir listing for `"freeze_nesting_level": 0` (default)
```
2bnxrFb8Ym4k7qx4vRv8Xs_l5Dg.png
La6qi18Z8LwgnZdsAr1qy1GwCwo.gif
X31pO5JJJKEifJ7sfvuf3mGeD_8.png
XNya0AroXD40MFsUD5H4-a4glA8.gif
```

Dir listing for `"freeze_nesting_level": 1`
```
2/
  bnxrFb8Ym4k7qx4vRv8Xs_l5Dg.png
L/
  a6qi18Z8LwgnZdsAr1qy1GwCwo.gif
X/
  31pO5JJJKEifJ7sfvuf3mGeD_8.png
  Nya0AroXD40MFsUD5H4-a4glA8.gif
```

Dir listing for `"freeze_nesting_level": 2`
```
2/
  b/
    nxrFb8Ym4k7qx4vRv8Xs_l5Dg.png
L/
  a/
    6qi18Z8LwgnZdsAr1qy1GwCwo.gif
X/
  3/
    1pO5JJJKEifJ7sfvuf3mGeD_8.png
  N/
    ya0AroXD40MFsUD5H4-a4glA8.gif
```
### setting nesting level per directory
```json
{
    "freeze_paths": {
        "i/bg/**": "bg_freeze",
        "i/gif/**": "gif_freeze",
        "i/usr/**": "freeze"
    },

    "freeze_nesting_levels": {
        "freeze": 0,
        "gif_freeze": 2
    },

    "freeze_nesting_level": 1
}
```
Nesting levels could also be set independently for each freeze directory with option `"freeze_nesting_levels"`.
In this case `"freeze_nesting_level"` option will affect only on those directories, which are missing in `"freeze_nesting_levels"` list.
Dir listing for the example above
```
# redefined to level 0
freeze/
  2bnxrFb8Ym4k7qx4vRv8Xs_l5Dg.jpg
  X31pO5JJJKEifJ7sfvuf3mGeD_8.jpg

# default level 1
bg_freeze/
  K/
    rFb8YmKEifJ7suf3m5vG_l5Dg8.png
  Z/
    Z8Lwgbnxrs_lm4k740M-a40Ar1.jpg

# redefined to level 2
gif_freeze/
  L/
    a/
      6qi18Z8LwgnZdsAr1qy1GwCwo.gif
  X/
    N/
      ya0AroXD40MFsUD5H4-a4glA8.gif
