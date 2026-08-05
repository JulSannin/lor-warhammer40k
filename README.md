# Весь лор Warhammer 40,000

Интерактивный лендинг-таймлайн по вселенной Warhammer 40,000 — от Войны в Небесах
(~60 000 000 лет до н.э.) до Эры Индомитус (М42). 11 разделов, подгружающихся
по мере прокрутки.

Исходный текст: [WARHAMMER_40K_LORE.md](WARHAMMER_40K_LORE.md).

## Стек

- Vite 8 + React 19 + TypeScript
- [Motion](https://motion.dev) — анимации и скролл-триггеры
- Чистый CSS с переменными, без UI-фреймворков

## Разработка

```bash
npm install
npm run dev      # локальный сервер
npm run build    # прод-сборка в ./dist
npm run preview  # посмотреть прод-сборку
npm run lint     # oxlint
```

## Деплой

Пуш в `main` запускает [.github/workflows/deploy.yml](.github/workflows/deploy.yml),
который собирает проект и публикует `dist/` на GitHub Pages.

Разово нужно включить Pages: **Settings → Pages → Source: GitHub Actions**.

В `vite.config.ts` стоит `base: './'` — сборка работает под любым именем
репозитория, путь никуда не зашит.

## Правовая заметка

Warhammer 40,000, все связанные названия, персонажи и изображения — собственность
Games Workshop Ltd. Некоммерческий фанатский проект, не аффилирован с Games Workshop.
Изображения подгружаются по внешним ссылкам с фан-вики.
