import { useEffect } from 'react'

/**
 * Заранее подтягивает картинки, которые вот-вот понадобятся.
 *
 * Не «загрузить всё»: картинок в проекте 26 МБ, и вываливать их на
 * читателя разом — значит забить канал тем, что он, возможно, никогда
 * не откроет. Подгружается только то, что рядом: кадры соседних
 * разделов и картинки справок по терминам этих разделов. К моменту,
 * когда читатель туда доберётся или откроет карточку, файл уже в кеше.
 *
 * Загрузка идёт в простое браузера и с низким приоритетом, чтобы не
 * соперничать с тем, что нужно показать прямо сейчас.
 */

/** Уже запрошенные адреса: второй раз не просим даже после перемонтирования. */
const asked = new Set<string>()

/** Сколько картинок тянем одновременно. */
const PARALLEL = 4

type Idle = (cb: () => void) => number
const idle: Idle =
  typeof requestIdleCallback === 'function'
    ? (cb) => requestIdleCallback(cb, { timeout: 1200 })
    : (cb) => setTimeout(cb, 200) as unknown as number

/**
 * Экономный режим или очень медленная сеть — не предзагружаем ничего.
 * Читатель на мобильном тарифе не просил качать ему запас.
 */
function allowed(): boolean {
  const c = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string }
    }
  ).connection
  if (!c) return true
  if (c.saveData) return false
  return c.effectiveType !== 'slow-2g' && c.effectiveType !== '2g'
}

export function usePrefetchImages(urls: string[]) {
  // Ключ по составу списка: массив пересоздаётся на каждый рендер,
  // а работа должна запускаться только когда список правда изменился
  const key = urls.join('|')

  useEffect(() => {
    if (!allowed()) return

    const queue = urls.filter((u) => u && !asked.has(u))
    if (queue.length === 0) return
    queue.forEach((u) => asked.add(u))

    let cancelled = false
    const pending = new Set<HTMLImageElement>()

    const next = () => {
      if (cancelled) return
      const url = queue.shift()
      if (!url) return
      const img = new Image()
      pending.add(img)
      /*
       * Приоритет обычный, а не низкий, — и это важнее, чем кажется.
       *
       * С низким выходило хуже, чем без предзагрузки вовсе: браузер
       * склеивает запросы одного адреса, и карточка, открытая по клику,
       * вставала в хвост уже начатой ленивой загрузке. Картинка не
       * появлялась секундами. Сдержанность обеспечивает очередь на
       * четыре файла, а не приоритет.
       */
      img.decoding = 'async'
      const done = () => {
        pending.delete(img)
        next()
      }
      img.onload = done
      img.onerror = () => {
        // Не получилось — пусть обычная загрузка попробует ещё раз
        asked.delete(url)
        done()
      }
      img.src = url
    }

    const handle = idle(() => {
      for (let i = 0; i < PARALLEL; i++) next()
    })

    return () => {
      cancelled = true
      /*
       * Начатое не обрываем, только перестаём следить.
       *
       * Сброс `img.src` действительно прекращает загрузку, но потом
       * этот адрес не грузится вовсе: карточка «Древних» открывалась
       * с пустым кадром, если её картинку успели начать и бросить.
       * Недокачанный файл — это несколько десятков килобайт низкого
       * приоритета; дать им дойти дешевле, чем сломать картинку.
       */
      pending.forEach((img) => {
        img.onload = null
        img.onerror = null
      })
      if (typeof cancelIdleCallback === 'function') cancelIdleCallback(handle)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
}
