# borschik

borschik is an extendable builder for text-based file formats.
Its main purpose is assembly of static files for web projects (CSS, JS, etc.).

You can get more info from the [article at bem.info](https://bem.info/articles/borschik).

## Installation

Prerequisites:

* [NodeJS](http://nodejs.org) >= 0.8.x
* [npm](https://github.com/isaacs/npm/)

From NPM, for use as a command line app:

    npm install borschik -g

From Git:

    git clone git://github.com/borschik/borschik.git

## Usage

```
borschik [OPTIONS]
```

The available options are:

    -h, --help                          Help

    -v, --version                       Current version

    -t TECH, --tech=TECH                Path to technology (default: file extension)
                                                                          [string]
    --tech-options=TECHOPTIONS          Additional options for tech in JSON format
                                                                          [string]
    -i INPUT, --input=INPUT             Input file (required)
                                                                          [string]
    -o OUTPUT, --output=OUTPUT          Output file (required)
                                                                          [string]
    -f FREEZE, --freeze=FREEZE          Freeze links to static files (default: true)
                                                                          [boolean]
    -m MINIMIZE, --minimize=MINIMIZE    Minimize resulting content (default: true)
                                                                          [boolean]
    -c COMMENTS, --comments=COMMENTS    Wrap included files with comments (default: true)
                                                                          [boolean]

## Technologies supported

| Tables         | CSS  | HTML   | JS        | JSON   |
| -------------  | ---- | ----   | ---       | ----   |
| Include        | X    | -      | X         | -      |
| Url processing | X    | X      | X         | X      |
| Url freeze     | X    | X      | X         | X      |
| Minimize       | CSSO | -      | UglifyJS*  | X      |

*: JS tech supports `--tech-options` that passed to UglifyJS.
```
$ borschik --input=myfile.js --tech-options='{"uglify":{"output":{"max_line_len": 100},"warnings":true}}'
```

## .borschik config description
```
{
  // path-mapping for changing urls
  // prefix may be relative or absoulte url
  "paths" : {
     "<original-path>": "<prefix-for-new-path>"
  },
  "follow_symlinks": {
     "<original-path>": "false|true" // follow or not
  },
  // path-mapping for freeze
  "freeze_paths": {
     "<wildcard-to-files>": "<path-for-frozen-files>"
  },

  // freeze nesting level (default 0)
  // read more https://github.com/borschik/borschik/blob/master/docs/freeze/freeze.en.md
  "freeze_nesting_level": <level>
}
```


## License
[MIT](https://github.com/borschik/borschik/blob/master/MIT-LICENSE.txt)
