# borschik

`borschik` — это расширяемый сборщик файлов текстовых форматов.
Его основной задачей является сборка статических файлов веб-проектов (CSS, JS и т.д.).

Для дополнительной информации читайте [статью про borschik](https://ru.bem.info/articles/borschik/) на bem.info.

## Установка

Требования:

* [NodeJS](http://nodejs.org) >= 0.8.x
* [npm](https://github.com/isaacs/npm/)

Установка из `npm` для использования из командой строки:

    npm install borschik -g

Установка из Git:

    git clone git://github.com/bem/borschik.git

## Использование

```
borschik [OPTIONS]
```

Доступные опции:

    -h, --help                          Помощь

    -v, --version                       Текущая версия

    -t TECH, --tech=TECH                Путь до технологии (по умолчанию: расширение файла)
                                                                          [string]
    -i INPUT, --input=INPUT             Входной файл (обязательная)
                                                                          [string]
    -o OUTPUT, --output=OUTPUT          Выходной файл (обязательная)
                                                                          [string]
    -f FREEZE, --freeze=FREEZE          Заморозка ссылок на статические ресурсы (по умолчанию: true)
                                                                          [boolean]
    -m MINIMIZE, --minimize=MINIMIZE    Минимизация входного файла (по умолчанию: true)
                                                                          [boolean]
    -c COMMENTS, --comments=COMMENTS    Поясняющие комментарии к склеенным файлам (по умолчанию: true)
                                                                          [boolean]

## Поддерживаемые технологии

| Tables         | CSS  | HTML   | JS        | JSON   |
| -------------  | ---- | ----   | ---       | ----   |
| Склейка        | X    | -      | X         | -      |
| Обработка ссылок | X    | X      | X         | X      |
| Заморозка ссылок     | X    | X      | X         | X      |
| Минимизация       | CSSO | -      | UglifyJS  | X      |

## Описание файла .borschik
```js
{
  // path-mapping для обработки ссылок
  // <prefix-for-new-path> может быть относительным или абсолютным урлом
  "paths" : {
     "<original-path>": "<prefix-for-new-path>"
  },
  "follow_symlinks": {
     "<original-path>": "false|true" // надо ли следовать по символическим ссылкам
  },
  // path-mapping для заморозки
  "freeze_paths": {
     "<wildcard-to-files>": "<path-for-freezed-files>"
  }
}
```


## Лицензия
[MIT](https://github.com/bem/borschik/blob/master/MIT-LICENSE.txt)
