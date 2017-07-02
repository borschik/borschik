# 2.0.0

* `uglify-js` заменен на `uglify-es` для поддержки ES6 (@stochastical [#141]).

# 1.7.1

* Исправлена ошибка с формированием путей в Windows (@raulleo [#139]).

### Зависимости

* `uglify-js` обновлён до `2.8.29`
* `coa` обновлён до `1.0.3`
* `minimatch` обновлён до `3.0.4`
* `vow` обновлён до `0.4.16`

# 1.7.0

* Хеш-функция, используемая при фризе статики была вынесена в отдельный пакет [borschik-hash](https://github.com/borschik/borschik-hash) (@blond [#132]).
* Прекращена поддержка node 0.8.0 (@Yeti-or [#133]).

### Зависимости

* `csso` обновлён до `^3.0.0`.
* `uglify-js` обновлён до `2.8.14`.
* `minimatch` обновлён до `3.0.3`.
* `vow` обновлён до `0.4.15`.

# 1.6.1

### Исправления

* В технологии `css` исправлено получение пути к файлу ресурса (@blond [#124]).

[#124]: https://github.com/borschik/borschik/pull/124

### Зависимости

* `uglify-js` обновлён до `2.7.4`.
* `minimatch` обновлён до `3.0.3`.
* `coa` обновлён до `1.0.1`.
* `inherit` обновлён до `2.2.6`.
* `vow-fs` обновлён до `0.3.6`.

# 1.6.0

* `csso` обновлён до `2.0.0`.

# 1.5.3
 * Исправлена обработка ошибок в `enb-borschik` [#112](https://github.com/borschik/borschik/pull/112)
 * `csso` обновлен до 1.7.0 [#116](https://github.com/borschik/borschik/pull/116)
 * `uglify-js` обновлен до 2.6.2 [#113](https://github.com/borschik/borschik/pull/113), [#108](https://github.com/borschik/borschik/issues/108), [#106](https://github.com/borschik/borschik/issues/106)
 * `UglifyJS` теперь показывает понятные ошибки минификации [#114](https://github.com/borschik/borschik/pull/114)
```
Error: Unexpected token: name (foo) (line: 7437, col: 12, pos: 312592)
  7435 |        };
  7436 |    } else {
  7437 |        let foo = 'bar';
--------------------^
  7438 |        result = {
  7439 |            result: 0
```

## 1.5.2
- `csso` обновлен до версии 1.5.4

## 1.5.1
- `uglify-js` обновлен до версии 2.6.1
- `csso` обновлен до версии 1.5.1

## 1.5.0
- `uglify-js` обновлен до версии 2.4.24
- `csso` обновлен до версии 1.4.2

## 1.4.0
- Теперь можно фризить `.woff2`, `.js`, `.css` и `.cur` файлы.
- Модуль `vow-fs` был обновлен до версии `0.3.4`.

## 1.3.2
Теперь можно фризить `.eot` файлы.

## 1.3.1
Теперь можно фризить `.ico` файлы.

## 1.3.0
**Новые возможности**
 * Настраивать фриз во вложенные папки теперь можно [отдельно для каждой директории](https://github.com/borschik/borschik/blob/master/docs/freeze/freeze.en.md#setting-nesting-level-per-directory).

## 1.2.0
**Новые возможности**
 * borschik теперь поддерживает в API `techOptions` как объект [#72](https://github.com/borschik/borschik/pull/72)

```js
// было (этот вариант тоже поддерживается)
borschik.api({
    techOptions: '{ "uglify": { "warnings": true } }'
});

// стало
borschik.api({
    techOptions: {
        uglify: {
            warnings: true
        }
    }
});
```

## 1.1.0
**Новые возможности**
 * borschik теперь может обрабатывать строки на вход [#69](https://github.com/borschik/borschik/pull/69). Используйте опции `inputString` и `basePath` в API

```
borschik.api({
    basePath: '.',
    inputString: 'var a = 1;',
    tech: 'js'
}).then(function(result) {

}, function(error) {

});
```

**Исправления**
 * Улучшена поддержка Windows [#66](https://github.com/borschik/borschik/pull/66)
 * Улучшен вывод ошибок при фризе [#71](https://github.com/borschik/borschik/pull/71)

## 1.0.5

- Исправлен инлайнинг SVG-фильтров [#64](https://github.com/borschik/borschik/issues/64)

## 1.0.4

-  Добавлена поддержка метода `encodeURI` для инлайнинга ресурсов [#62](https://github.com/borschik/borschik/issues/62)

## 1.0.3

-  Улучшена совместимость с LESS [#59](https://github.com/borschik/borschik/issues/59)

## 1.0.2

-  Поддержка передача параметров для UglifyJS в технологии JS.

```
$ borschik --input=myfile.js --tech-options='{"uglify":{"output":{"max_line_len": 100},"warnings":true}}'
```

## 1.0.1

-  Поддержка `borschik.link()` в node.js.

## 1.0.0

- borschik теперь версионируется по semver.
- [Добавили поддержку wildcard для freeze_path](https://github.com/borschik/borschik/issues/23). Это изменение ломает совместимость со старым поведением:
  - путь для фриза теперь относителен конфига `.borschik`, как и все остальные опции (`paths`, `follow_symlinks`)
  - вместо пути `./images` теперь надо писать `./images/**`. Например

  ```json
  "freeze_paths": {
        "./static/images/**": "./static/freeze"
  }
  ```

  т.е. все ресурсы из static/images будут зафрижены в static/freeze. Раньше надо было писать вот так

  ```json
  "freeze_paths": {
        "./static/images": "../freeze"
  }
  ```

- Добавили [поддержку для фриза во вложенные папки](https://github.com/borschik/borschik/blob/master/docs/freeze/freeze.en.md#nesting-level).
- Добавили [новый параметр](https://github.com/borschik/borschik/pull/56) `--tech-options "<json>"` для передачи любых параметров в технологию.
- Для инклюда js-файлов добавили [новый синтаксис](https://github.com/borschik/borschik/pull/48) `borschik.include('./path/to/file.js')`.

## 0.4.2

- Добавили поддержку инлайнинга jpg-файлов.
- Обновили зависимости: csso@1.3.10, uglify-js@2.4.6, vow@0.3.12.

## 0.4.1

- Добавили поддержку инлайнинга ttf-файлов.
- Добавили [вывод результатов в stdout при неудачной минификации](https://github.com/borschik/borschik/issues/28).

## 0.4.0
Эта версия частично несовместима с 0.3.x.

- Обновили систему плагинов. Подробнее см. в [документации](https://github.com/borschik/borschik/blob/master/docs/where-is-my-tech/where-is-my-tech.en.md).
- Добавили [поддержку инлайнинга ресурсов](https://github.com/borschik/borschik/issues/9). Подробнее см. в [документации](https://github.com/borschik/borschik/blob/master/docs/freeze/freeze.en.md#resource-inlining).
- Обновили [нотация js-include](https://github.com/borschik/borschik/issues/16). Подробнее см. в [документации](https://github.com/borschik/borschik/blob/master/docs/js-include/js-include.en.md).
- Для промисов используется [vow](https://github.com/dfilatov/jspromise) вместо [q](https://github.com/kriskowal/q).
- Удалены устаревшие технологии: `css-fast` и `js-link`.
- Технология `json-links` переименована в `json`.
- [OmetaJS](https://github.com/borschik/borschik-tech-css-ometajs) и [CoffeeScript](https://github.com/borschik/borschik-tech-js-coffee) вынесены из основного репозитория в плагины.
- Исправлены проблемы с freeze в технологии html ([#30](https://github.com/borschik/borschik/issues/30), [#39](https://github.com/borschik/borschik/issues/39)).
- UglifyJS обновлен до 2.4.0.

## 0.3.5
- Исправлена регрессия после https://github.com/borschik/borschik/issues/7.

## 0.3.4
[Список задач к релизу 0.3.4](https://github.com/borschik/borschik/issues?milestone=3&state=closed).

- [Исправлено поведение follow_symlinks](https://github.com/borschik/borschik/issues/7).
- [Технология CSS удаляет дублирующие @import](https://github.com/borschik/borschik/issues/4).
- Обновлена документация на русском и английском языках.

## 0.3.3
Обновлены зависимости:

- coa ~0.4.0
- inherit ~1.0.4
- q ~0.9.5
- ometajs ~3.2.4
- uglify-js ~2.3.6
- istanbul ~0.1.42
- mocha ~1.12.0

## 0.3.2
- UglifyJS обновлен до ~2.3.
- CSSO обновлен до 1.3.7.
- Исправлена проблема с freeze и mkdir (https://github.com/veged/borschik/issues/90).
- Объеденены технологии `js` и `js-link`. `js-link` устарела и будет удалена.

## 0.3.1
- Исправлены проблемы совместимости с Windows.
