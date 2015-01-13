# Заморозка (freeze) статических ресурсов

О том, что такое «заморозка», и преимуществах этой технологии можно подробнее прочесть в [статье на bem.info](http://ru.bem.info/articles/borschik/#«Заморозка»-статических-ресурсов--freeze-).

## Конфигурационный файл `.borschik`

Конфигурация описывается в файле `.borschik` в виде JSON-объекта.

Файл `.borschik` влияет на директорию, в которой он лежит, и на все вложенные директории.

```js
{
    "freeze_paths": {
        "i/bg/**": "freeze/bg",
        "i/ico/**": "freeze/ico"
    }
}
```

`freeze_paths` — этот объект определяет, какие файлы будут заморожены и где будут находиться результаты заморозки.

Например, если borschik будет обрабатывать CSS-файлы и обнаружит ссылки на изображения, лежащие в директории `/i/bg`, он их заморозит, изменит путь на `freeze/bg` и скопирует изображения в эту директорию.

Ключи объекта — шаблон, определяющий, какие файлы будут заморожены. Шаблон определяет совпадения при помощи библиотеки [minimatch](https://github.com/isaacs/minimatch).

Значения ключей — пути к директориям для замороженных файлов относительно файла конфигурации.

Другой пример
```js
{
    "freeze_paths": {
        "i/bg/**": "i/_"
    }
}
```
borschik заморозит файлы из директории `i/bg` в директорию `i/_`.

**Обратите внимание**
* borschik замораживает не все файлы, найденные в директориях, а только те, на которые есть ссылки в обрабатываемом файле.
* borschik создает копию исходных файлов в директории для замороженных файлов. Именем файла будет хеш-сумма от содержимого файла.

## Встраивание ресурсов

Можно использовать специальный синтаксис (`:encodeURI:`, `:encodeURIComponent:` и `:base64:`) для встраивания ресурсов.

```json
{
    "freeze_paths": {
        "i/svg_images/**": ":encodeURIComponent:",
        "i/gif_images/**": ":base64:"
    }
}
```

Эта конфигурация означает, что все ссылки на ресурсы, расположенные в директориях `i/svg_images` или `i/gif_images`, будут заменены на встроенные ресурсы.

borschik поддерживает только три варианта встраивания: `base64`, `encodeURI` и `encodeURIComponent`.

borschik поддерживает следующие форматы файлов: gif, png, svg, woff.

Например, содержимое файла
```css
.gif {
    background: url("i/gif_images/icon.gif");
}
.svg {
    background: url("i/svg_images/image.svg");
}
```

будет преобразовано в следующий код
```css
.gif {
    background: url("data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==");
}
.svg {
    background: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org.......");
}
```

Также поддерживается встраивание JS-файлов при помощи метода `borschik.link()`.

## Уровни вложенности
```json
{
    "freeze_paths": {
        "i/bg/**": "freeze",
        "i/ico/**": "freeze"
    },

    "freeze_nesting_level": 2
}
```

Определение уровней вложенности используется для улучшения производительности сервера на проектах с большим количеством замороженных файлов.

Как правило, сервера испытывают затруднения при работе с директориями, включающими более 1000 файлов. Для решения этой проблемы применяют разделение таких директорий на несколько поддиректорий.

Примеры

Листинг каталога с `"freeze_nesting_level": 0` (значение по умолчанию).
```
2bnxrFb8Ym4k7qx4vRv8Xs_l5Dg.png
La6qi18Z8LwgnZdsAr1qy1GwCwo.gif
X31pO5JJJKEifJ7sfvuf3mGeD_8.png
XNya0AroXD40MFsUD5H4-a4glA8.gif
```

Листинг каталога с `"freeze_nesting_level": 1`.
```
2/
  bnxrFb8Ym4k7qx4vRv8Xs_l5Dg.png
L/
  a6qi18Z8LwgnZdsAr1qy1GwCwo.gif
X/
  31pO5JJJKEifJ7sfvuf3mGeD_8.png
  Nya0AroXD40MFsUD5H4-a4glA8.gif
```

Листинг каталога с `"freeze_nesting_level": 2`.
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
### Настройка уровня вложенности для каждой директории
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
Уровни вложенности можно установить отдельно для каждой директории заморозки, используя параметр `"freeze_nesting_levels"`. В этом случае опция `"freeze_nesting_level"` будет влиять только на директории, которые не были определены в списке `"freeze_nesting_levels"`.

Пример выше приведет к такой структуре директорий с замороженными файлами:
```
# переопределение к уровню 0
freeze/
  2bnxrFb8Ym4k7qx4vRv8Xs_l5Dg.jpg
  X31pO5JJJKEifJ7sfvuf3mGeD_8.jpg

# значение по умочанию — 1
bg_freeze/
  K/
    rFb8YmKEifJ7suf3m5vG_l5Dg8.png
  Z/
    Z8Lwgbnxrs_lm4k740M-a40Ar1.jpg

# переопределено к уровню 2
gif_freeze/
  L/
    a/
      6qi18Z8LwgnZdsAr1qy1GwCwo.gif
  X/
    N/
      ya0AroXD40MFsUD5H4-a4glA8.gif
