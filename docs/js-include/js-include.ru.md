# Нотация для JS include

borschik поддерживает объединение js-файлов, но поскольку в JavaScript нет стандартного способа для ипортирования файлов, borschik использует синтаксическую конструкцию `borschik:include:path/to/fie.js`.

Это выражение может быть определено:
* как блочный комментарий `/*borschik:include:file.js*/`
* в фигурных скобках, как объект `{/*borschik:include:file.js*/}`
* в квадратных скобках, как массив `[/*borschik:include:file.js*/]`
* как строка `"borschik:include:file.js"`.

Комментарии и строка имеют разное назначение

## /* borschik:include:path/file.js */
Если `include` определён внутри комментария, он будет заменён на содержимое файла без каких либо преобразований.

`page.js`
```js
var prj = {};
/* borschik:include:components/cookie.js */
```

Результат:
```js
var prj = {};
/* components/cookie.js begin */
prj.cookie = {
    set: function(){},
    get: function(){}
};

/* components/cookie.js end */
```

Если попытаться подключить содержимое json-файла таким способом — возникнет ошибка валидации файла.
```js
var myData = /* borschik:include:file.json */;
```

Для таких ситуаций borschik предусматривает запись в виде объекта или массива.
```js
// запись в виде объекта
var myData = {/* borschik:include:file.json */};
```

```js
// запись в виде массива
var myData = [/* borschik:include:file.json */];
```

*И комментарий, и окружающие его скобки* в примерах выше будут заменены на содержимое файла.

Нет никакой разницы между `{}` и `[]`. Возможность использовать разную запись сделана исключительно из соображений улучшения стиля написания кода.

## "borschik:include:path/file.js"
Если `include` находится внутри строки, она будет заменена на результат применения метода `JSON.stringify` к содержимому подключаемого файла.

`page.js`
```js
prj.STATIC_HOST = "borschik:include:components/host.txt";
```

`page.js` будет преобразован к виду:
```js
prj.STATIC_HOST = "//yandex.st";
```
