# Borschik

Borschik is an extendable builder for text-based file formats.
Its main purpose is assembly of static files for web projects (CSS, JS, etc.).

You can get more info from the [article at bem.info](http://bem.info/articles/borschik)

## Installation

Prerequisites:

* nodejs >= 0.6.x&nbsp;— [http://nodejs.org](http://nodejs.org)
* npm&nbsp;— [http://github.com/isaacs/npm/](http://github.com/isaacs/npm/)

From NPM, for use as a command line app:

```bash
npm install borschik -g
```

From Git:
```bash
git clone git://github.com/bem/borschik.git
```

## Usage

```bash
borschik [OPTIONS]
```

## The available options are:

|                                  |                                                                        |
| -------------------------------- | ---------------------------------------------------------------------- |
| -h, --help                       | Help |
| -v, --version                    | Current version |
| -t TECH, --tech=TECH             | Path to technology (default: file extension) [string] |
| -i INPUT, --input=INPUT          | Input file (required) [string] |
| -o OUTPUT, --output=OUTPUT       | Output file (required) [string] |
| -f FREEZE, --freeze=FREEZE       | Freeze links to static files (default: true) |
| -m MINIMIZE, --minimize=MINIMIZE | Minimize resulting content (default: true) [boolean] |
| -c COMMENTS, --comments=COMMENTS | Wrap included files with comments (default: true) [boolean] |


## Technologies supported

| Tables         | CSS  | HTML   | JS        | JSON   |
| -------------  | ---- | ----   | ---       | ----   |
| Include        | X    | -      | X         | -      |
| Url processing | X    | X      | X         | X      |
| Url freeze     | X    | X      | X         | X      |
| Minimize       | CSSO | -      | UglifyJS  | X      |

## .borschik config description
```javascript
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
     "<original-path-to-files>": "<path-for-frozen-files>"
  }
}
```


## License
[MIT](/MIT-LICENSE.txt)
