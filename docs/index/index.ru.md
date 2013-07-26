# Borschik

Borschik — это расширяемый сборщик файлов текстовых форматов.
Его основной задачей является сборка статических файлов веб-проектов (CSS, JS
и т.д.).

[Статья про Borschik на bem.info](http://ru.bem.info/articles/borschik/)

## Установка

Требования:

* nodejs >= 0.6.x&nbsp;— [http://nodejs.org](http://nodejs.org)
* npm&nbsp;— [http://github.com/isaacs/npm/](http://github.com/isaacs/npm/)

Установка из npm для использования из командой строки:

    npm install borschik -g

Установка из Git:

    git clone git://github.com/bem/borschik.git

## Испольнозвание

```
borschik [OPTIONS]
```

Доступные опции:

    -h, --help                          Помощь

    -v, --version                       Текущая версия

    -t TECH, --tech=TECH                Пусть до технологии (по умолчанию: расширение файла)
                                                                          [string]
    -i INPUT, --input=INPUT             Входной файл (обязательная)
                                                                          [string]
    -o OUTPUT, --output=OUTPUT          Выходной файл (обязательная)
                                                                          [string]
    -f FREEZE, --freeze=FREEZE          Замораживать ссылки на статические ресурсы (по умолчанию: yes)
                                                                          [boolean]
    -m MINIMIZE, --minimize=MINIMIZE    Минимизировать выходной файл (по умолчанию: yes)
                                                                          [boolean]
    -c COMMENTS, --comments=COMMENTS    Оборачивать склееные файлы в поясняющие комментарии (по умолчанию: yes)
                                                                          [boolean]

## Поддерживаемые технологии

| Tables         | CSS  | HTML   | JS        | JSON   |
| -------------  | ---- | ----   | ---       | ----   |
| Склейка        | X    | -      | X         | -      |
| Обработка ссылок | X    | X      | X         | X      |
| Заморозка ссылок     | X    | X      | X         | X      |
| Минимизиация       | CSSO | -      | UglifyJS  | X      |

## Описание файла .borschik
```
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
     "<original-path-to-files>": "<path-for-freezed-files>"
  }
}
```


## Лицензия
[MIT](/MIT-LICENSE.txt)
