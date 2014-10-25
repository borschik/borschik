var PATH = require('path'),
    URL = require('url'),
    INHERIT = require('inherit'),
    VOW = require('vow'),
    U = require('./util'),
    SOURCEMAP = require('source-map'),
    ESPRIMA = require('esprima');

/**
 * Генератор карт кода
 * @param {object} opts настройки
 * @param {string} opts.sourceMap файл, в который будет записана карта
 * @param {string} opts.fileName путь/название файла объединенного кода
 * @param {string} [opts.sourceMapRoot] корень для относительных адресов источников
 * @param {string} [opts.sourceMapUrl] значение sourceMappingURL, по умолчанию имя файла в sourceMap
 * @param {boolean} [opts.sourceMapIncludeSources] включать в файл-карту исходный код
 */
function SourceMap(opts) {
    this._options = {
        'sourceMap': opts.sourceMap,
        'sourceMapRoot': String(opts.sourceMapRoot || ''),
        'sourceMapUrl': opts.sourceMapUrl || PATH.basename(opts.sourceMap),
        'fileName': opts.fileName,
        'sourceMapIncludeSources': Boolean(opts.sourceMapIncludeSources),
        'root': process.cwd() // относительно какой директории будут строиться пути к файлам-источникам
    };

    this._sources = {};
    this._mapping = [];
    this._generator = null;
    this._generatedCursor = { line: 1, column: 0 };
}

/**
 * Добавление исходного кода ресурса
 * @param {File} sourceFile файл ресурса
 * @param {string|Buffer} content исходный код
 */
SourceMap.prototype.addSource = function(sourceFile, content) {
    if (!content || !this._options.sourceMapIncludeSources) {
        return;
    }

    if (Buffer.isBuffer(content)) {
        content = content.toString('utf8');
    }

    this._sources[ sourceFile.path ] = content;
};

/**
 * Добавление точки соответствия
 * @param {File} sourceFile файл ресурса
 * @param {string} chunk часть файла ресурса, для которой требуется сохранить соответствие
 * @param {number} origline номер строки в исходном файле
 * @param {number} origcolumn номер столбца в исходном файле
 */
SourceMap.prototype.addMapping = function(sourceFile, chunk, origline, origcolumn) {
    if (!chunk.trim()) {
        return;
    }

    var tokens;

    try {
        // добавление '\n"";' в конец немного чинит парсинг, например в случае инклуда json
        tokens = ESPRIMA.parse(chunk + '\n"";', {
            tokens: true,
            loc: true,
            tolerant: true // подавление ошибок парсинга не работает, и кидает исключение

        }).tokens.filter(function(token) {
            return (token.type === 'Identifier');
        });

    } catch(e) {
        // возможно стоит добавлять строки, но проку от них мало
        return;
    }

    var path = sourceFile.path;
    var genline = this._generatedCursor.line;
    var gencolumn = this._generatedCursor.column;

    tokens.forEach(function(token) {
        var line = token.loc.start.line - 1;
        var column = token.loc.start.column;

        if (line) {
            gencolumn = 0;
            origcolumn = 0;
        }

        this._mapping.push({
            'source': path,
            'name': token.value,
            'generatedLine': genline + line,
            'generatedColumn': gencolumn + column,
            'originalLine': origline + line,
            'originalColumn': origcolumn + column
        });

    }, this);
};

/**
 * Хапись карты в файле
 * @param {string} content собранный код
 * @returns {Promise}
 */
SourceMap.prototype.write = function(content) {
    var map = this._generate();

    if (!map) {
        return VOW.fulfill(content);
    }

    var promise = VOW.promise();

    U.writeFile(
        this._options.sourceMap,
        map.toString()
    )
    .then(function() {
        // uglify-js добавляет ссылку на map после минимизации
        if (content.lastIndexOf('sourceMappingURL') === -1) {
            content += '\n//# sourceMappingURL=' + this._options.sourceMapUrl;
        }

        promise.fulfill(content);

    }, function() {
        promise.fulfill(content);

    }, this);

    return promise;
};

/**
 * Сдвиг курсора на размер блока
 * @param {string} content блок, на рамер которого нужно сдвинуть курсор
 */
SourceMap.prototype.moveGeneratedCursor = function(content) {
    __moveCursor(content, this._generatedCursor);
};

/**
 * Добавление параметров генерации карты для UglifyJs
 * @param {object} options объект параметров
 * @returns {boolean} true, если параметры были добавлены
 */
SourceMap.prototype.uglifyJsUpdateOptions = function(options) {
    var map = this._generate();

    if (!map) {
        return false;
    }

    options.inSourceMap = map.toJSON();
    options.outSourceMap = this._options.sourceMapUrl || this._options.sourceMap;
    options.sourceRoot = this._options.sourceMapRoot;
    options.sourceMapIncludeSources = this._options.sourceMapIncludeSources;

    return true;
};

/**
 * Замена карты, на значение полученное из UglifyJs
 * @param {object} map карта UglifyJs
 */
SourceMap.prototype.uglifyJsSetMapping = function(sourceMap) {
    this._generator = SOURCEMAP.SourceMapGenerator.fromSourceMap(
        new SOURCEMAP.SourceMapConsumer(sourceMap)
    );
};

/**
 * Генерация карты
 * Объект генерируется один раз, после этого исходные карты и источники очищаются
 * и возвращается ссылка на генератор
 * @returns {SourceMapGenerator} объект генератор карты
 * @private
 */
SourceMap.prototype._generate = function() {
    if (this._generator) {
        return this._generator;
    }

    if (!this._mapping.length) {
        return null;
    }

    this._generator = new SOURCEMAP.SourceMapGenerator({
        'file': this._options.fileName,
        'sourceRoot': this._options.sourceMapRoot
    });

    Object.keys(this._sources).forEach(function(source) {
        this._generator.setSourceContent(
            PATH.relative(this._options.root, source),
            this._sources[ source ]
        );

    }, this);

    this._mapping.forEach(function(map) {
        this._generator.addMapping({
            'source': PATH.relative(this._options.root, map.source),
            'name': map.name,
            'generated': {
                'line': map.generatedLine,
                'column': map.generatedColumn
            },
            'original': {
                'line': map.originalLine,
                'column': map.originalColumn
            }
        });

    }, this);

    // генератор заполняется 1 раз
    // больше исходники не нужны
    this._sources = {};
    this._mapping = [];

    return this._generator;
};


exports.init = function(opts) {
    if (!opts.sourceMap || !opts.fileName) {
        return null;
    }

    return new SourceMap(opts);
};

/**
 * Сдвиг курсора на размер блока
 * @param {string} content блок, на рамер которого нужно сдвинуть курсор
 * @param {object} cursor начальная позиция курсора
 */
function __moveCursor(content, cursor) {
    if (!content) {
        return cursor;
    }

    var lines = content.split('\n');
    cursor.line += lines.length - 1;

    var lastLine = lines.pop();

    if (lines.length) {
        cursor.column = lastLine.length;

    } else {
        cursor.column += lastLine.length;
    }

    return cursor;
}

exports.moveCursor = __moveCursor;
