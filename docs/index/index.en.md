# Borschik

Borschik is an extendable builder for text-based file formats.
It's main purpose is the assembly of static files for web projects (CSS, JS, etc.).

You can get more info in [article at bem.info](http://bem.info/articles/borschik)

## Install

Prerequisites:

* nodejs >= 0.6.x&nbsp;— [http://nodejs.org](http://nodejs.org)
* npm&nbsp;— [http://github.com/isaacs/npm/](http://github.com/isaacs/npm/)

From NPM for use as a command line app:

    npm install borschik -g

From Git:

    git clone git://github.com/bem/borschik.git

## Usage

```
borschik [OPTIONS]
```

The available options are:

    -h, --help                          Help

    -v, --version                       Current version

    -t TECH, --tech=TECH                Path to technology (default: file extenstion)
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

## Technologies support

| Tables         | CSS  | HTML   | JS        | JSON   |
| -------------  | ---- | ----   | ---       | ----   |
| Include        | X    | -      | X         | -      |
| Url processing | X    | X      | X         | X      |
| Url freeze     | X    | X      | X         | X      |
| Minimize       | CSSO | -      | UglifyJS  | X      |

## .borschik config description
```
{
  // path-mapping for url changing
  // prefix may be relative or absoulte url
  "paths" : {
     "<original-path>": "<prefix-for-new-path>"
  },
  "follow_symlinks": {
     "<original-path>": "false|true" // follow or not
  },
  // path-mapping for freeze
  "freeze_paths": {
     "<original-path-to-files>": "<path-for-freezed-files>"
  }
}
```


## License
[MIT](/MIT-LICENSE.txt)
