<!--
{
    "title": "JS Include Notations",
    "createDate": "08-09-2013",
    "editDate": "",
    "summary": "borschik can merge JS files. But there is no standard method for this in Javascript so borschik uses the syntax described in this article.",
    "thumbnail": "",
    "authors": ["androsov-alexey"],
    "tags": ["tools", "borschik"],
    "translators": [],
    "type": "tools"
}
#META_LABEL-->

# JS include notations

borschik can merge JS files.
But there is no standard method for this in Javascript so borschik uses the following syntax `borschik:include:path/to/fie.js`.

This expression must be in:
* block comment `/*borschik:include:file.js*/`
* curly brackets like object `{/*borschik:include:file.js*/}`
* square brackets like array `[/*borschik:include:file.js*/]`
* string `"borschik:include:file.js"`.


Comment and string have several semantic.

## /* borschik:include:path/file.js */
If `include` is in a comment it will be replaced by the file's content without any transformation.
`page.js`
```js
var prj = {};
/* borschik:include:components/cookie.js */
```

Result:
```js
var prj = {};
/* components/cookie.js begin */
prj.cookie = {
    set: function(){},
    get: function(){}
};

/* components/cookie.js end */
```

There are some problems with code validity in case you want to include JSON file like this
```js
var myData = /* borschik:include:file.json */;
```

For this case `borschik` has object and array notations.
```js
// object notation
var myData = {/* borschik:include:file.json */};
```

```js
// array notation
var myData = [/* borschik:include:file.json */];
```

In these examples **block comment and brackets** will be replace with file content.

There is no differents beetween `{}` and `[]` notations. This options is for better code style only.

## "borschik:include:path/file.js"
If `include` is in a string it will be replaced with the result of applying `JSON.stringify` to the file's content.
`page.js`
```js
prj.STATIC_HOST = "borschik:include:components/host.txt";
```

`page.js` will be transformed to:
```js
prj.STATIC_HOST = "//yandex.st";
```
