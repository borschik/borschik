# borschik и технологии

borchik использует следующие правила для поиска путей к технологиям:

1. Если путь начинается с `/` или `.`, borschik явно использует переданный путь. Например: `borschik -t ./my-tech/tech.js -i my-file.ext`
2. Пытается загрузить технологию из каталога `borschik/lib/techs/<технология>`. Например: `borschik -t css -i my-file.css`
3. В противном случае пытается загрузить npm-пакет `borschik-tech-<технология>` Этот пример загружает npm-пакет 'borschik-tech-js-coffee': `borschik -t js-coffee -i my-file.coffee`

    