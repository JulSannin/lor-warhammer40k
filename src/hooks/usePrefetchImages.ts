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
 * Очередь одна на всё приложение, и это принципиально. Сначала предел
 * в четыре файла стоял на каждый запуск: при быстрой прокрутке запусков
 * набирался десяток, в полёте оказывалось под сорок запросов разом, и
 * картинка открытой карточки делила канал со всеми — появлялась через
 * секунды. Общая очередь держит ровно четыре, сколько бы разделов
 * читатель ни пролистал.
 */

/** Уже запрошенные адреса: второй раз не просим даже после перемонтирования. */
const asked = new Set<string>()

/** Сколько картинок тянем одновременно — на всё приложение, а не на вызов. */
const PARALLEL = 4

const queue: string[] = []
let active = 0

function pump() {
  while (active < PARALLEL && queue.length > 0) {
    const url = queue.shift()!
    active += 1
    const img = new Image()
    /*
     * Приоритет обычный, а не низкий, — и это важнее, чем кажется.
     * Браузер склеивает запросы одного адреса, и с низким приоритетом
     * карточка, открытая по клику, вставала в хвост уже начатой фоновой
     * загрузке. Сдержанность обеспечивает очередь, а не приоритет.
     */
    img.decoding = 'async'
    const done = () => {
      active -= 1
      pump()
    }
    img.onload = done
    img.onerror = () => {
      // Не получилось — пусть обычная загрузка попробует ещё раз
      asked.delete(url)
      done()
    }
    img.src = url
  }
}

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

    const fresh = urls.filter((u) => u && !asked.has(u))
    if (fresh.length === 0) return
    fresh.forEach((u) => asked.add(u))

    // В начало очереди: читатель сейчас здесь, а не там, где был
    const handle = idle(() => {
      queue.unshift(...fresh)
      pump()
    })

    return () => {
      /*
       * Уже начатое не обрываем, только вынимаем из очереди то, что
       * ещё не стартовало. Сброс `img.src` действительно прекращает
       * загрузку, но после него этот адрес не грузится вовсе: карточка
       * открывалась с пустым кадром, если её картинку успели бросить.
       */
      for (const url of fresh) {
        const at = queue.indexOf(url)
        if (at !== -1) {
          queue.splice(at, 1)
          asked.delete(url)
        }
      }
      if (typeof cancelIdleCallback === 'function') cancelIdleCallback(handle)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
}
