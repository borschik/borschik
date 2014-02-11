<!--
{
    "title": "Static resources \"freeze\"",
    "createDate": "09-09-2013",
    "editDate": "14-09-2013",
    "summary": "borschik technique for static resource loading.",
    "thumbnail": "",
    "authors": ["androsov-alexey"],
    "tags": ["tools", "borschik"],
    "translators": [],
    "type": "tools"
}
#META_LABEL-->

# Static resources "freeze"

What means "freeze", description and advantages of this technology you can get in [article at bem.info](http://bem.info/articles/borschik).

## .borschik config

At first we need config. It's located in file `.borschik`.

File `.borschik` relates to its own directory and all subdirectories.
```js
{
    "freeze_paths": {
        "i/bg": "../../_", // result path is "_"
        "i/ico": "../_" // result path is "i/_"
    }
}
```

`freeze_paths` — this key defines which files will be frozen, and where any transformations in the file path of the frozen result.

For example, when Borschik processes CSS file and finds links to images in `/i/bg`,
borschik freezes these links, changing their path to `/_` (because `/i/bg/../../_` is '/_' ) and creates image copy in this path.

Object key — directories whose files will be frozen.
Key value - directory for resulting frozen files, relative to their initial path.

Other example
```js
{
    "freeze_paths": {
        "i/bg": "_" // result path is 'i/bg/_'
    }
}
```
Borschik freezes files from directory `i/bg` to `i/bg/_`

**Important note:**
* Borschik does not freeze all files in directories but only those linked by processed files.
* Borschik creates a copy of original files in freeze dir whose filename is a checksum of the file content.

## resource inlining
There is special syntax (`:encodeURIComponent:` and `:base64:`) for resource inlining.

```json
{
    "freeze_paths": {
        "i/svg_images": ":encodeURIComponent:",
        "i/gif_images": ":base64:"
    }
}
```

With this config all links to resources in `i/svg_images` or `i/gif_images` will be inlined.

Borschik supports `base64` and `encodeURIComponent` encoding only.

Borschik supports following file formats: gif, png, svg, woff.

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

Inlining in JS-files with `borschik.link()` is also supported.
