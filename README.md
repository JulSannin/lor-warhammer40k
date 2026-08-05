# Краткий лор Warhammer 40K

Интерактивный лендинг-таймлайн по вселенной Warhammer 40,000 — от Войны в Небесах
(~60 000 000 лет до н.э.) до Эры Индомитус (М42). 11 разделов, 51 событие,
34 изображения.

**Сайт:** https://julsannin.github.io/lor-warhammer40k/

Исходный текст: [WARHAMMER_40K_LORE.md](WARHAMMER_40K_LORE.md).

## Стек

- Vite 8 + React 19 + TypeScript
- [@tanstack/react-virtual](https://tanstack.com/virtual) — виртуализация прокрутки
- [react-loading-skeleton](https://github.com/dvtng/react-loading-skeleton) — заглушки картинок
- Чистый CSS с переменными, без UI-фреймворков. Анимации тоже на CSS:
  библиотека анимаций была убрана, она давала треть веса бандла и создавала
  до семнадцати наблюдателей на раздел

## Команды

```bash
npm install
npm run dev      # локальный сервер
npm run build    # прод-сборка в ./dist
npm run preview  # посмотреть прод-сборку
npm run lint     # oxlint
npm run format   # prettier
npm run content  # пересобрать данные из WARHAMMER_40K_LORE.md
npm run images   # докачать изображения в public/img (--force — перекачать все)
```

`content` запускается автоматически перед `dev` и `build`, поэтому markdown
остаётся единственным источником правды: правишь текст — сайт обновляется.

## Как устроены данные

Два слоя:

- **Машинный.** [scripts/build-content.mjs](scripts/build-content.mjs) разбирает
  markdown в `src/data/content.generated.json`: абзацы, заголовки, таблицы,
  цитаты, списки и врезки «[спорно]». Файл не редактируется руками.
- **Редакторский.** [src/data/meta.ts](src/data/meta.ts) — эпохи, события лент,
  акцентные цвета. [src/data/images.ts](src/data/images.ts) — изображения.
  [src/data/index.ts](src/data/index.ts) сшивает всё и падает с ошибкой, если
  для раздела нет метаданных.

В `src/data/index.ts` есть таблица замеренных высот разделов — из неё
складывается высота документа до того, как разделы построены, поэтому ползунок
прокрутки не скачет. Если сильно править лор, высоты стоит перемерить: как —
описано там же в комментарии.

## Деплой

Пуш в `main` запускает [.github/workflows/deploy.yml](.github/workflows/deploy.yml),
который собирает проект и публикует `dist/` на GitHub Pages.

Разово нужно включить Pages: **Settings → Pages → Source: GitHub Actions**.

В `vite.config.ts` стоит `base: './'` — сборка работает под любым именем
репозитория, путь никуда не зашит. Исключение — `og:image` в `index.html`:
сборщики превью не умеют разрешать относительные пути, поэтому там абсолютный
адрес, и при переезде на другой домен его нужно поменять.

## Правовая заметка

Warhammer 40,000, все связанные названия, персонажи и изображения — собственность
Games Workshop Ltd. Некоммерческий фанатский проект, не аффилирован с Games Workshop.
Изображения загружены с фан-вики и хранятся в `public/img`; исходная ссылка каждого
файла указана в поле `remote` в `src/data/images.ts`.
