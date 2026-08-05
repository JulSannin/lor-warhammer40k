import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

export interface MountKey {
  /** Короткий латинский id раздела. */
  id: string
  /** Якорь в стиле GitHub из исходного markdown. */
  anchor: string
}

interface Progressive {
  /** Сколько разделов сейчас в DOM. */
  count: number
  /** Ставится сразу за последним смонтированным разделом. */
  sentinelRef: React.RefObject<HTMLDivElement | null>
}

/**
 * Гибридная подгрузка разделов.
 *
 * В DOM изначально только первый раздел. Маячок за последним
 * смонтированным раздел «замечается» за 1200px до появления на экране,
 * поэтому следующий раздел успевает построиться до того, как читатель
 * до него доскроллит — стык незаметен.
 *
 * Переход по прямой ссылке на якорь обрабатывается отдельно: браузер сам
 * никуда не прокрутит, если целевого элемента ещё нет в документе. Поэтому
 * при смене хеша сначала монтируем всё до нужного раздела, а прокручиваем
 * уже после того, как он окажется в DOM.
 */
export function useProgressiveMount(keys: MountKey[]): Progressive {
  const total = keys.length
  const [count, setCount] = useState(1)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const pendingScroll = useRef<string | null>(null)

  const indexOfHash = useCallback(
    (hash: string) => {
      const key = decodeURIComponent(hash).replace(/^#/, '')
      if (!key) return -1
      return keys.findIndex((k) => k.id === key || k.anchor === key)
    },
    [keys],
  )

  /** Домонтировать всё вплоть до указанного раздела. */
  const reveal = useCallback(
    (index: number) => setCount((c) => Math.max(c, Math.min(total, index + 1))),
    [total],
  )

  // Подгрузка по мере прокрутки
  useEffect(() => {
    if (count >= total) return
    const node = sentinelRef.current
    if (!node) return

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setCount((c) => Math.min(total, c + 1))
        }
      },
      // Запас снизу — это и есть «предзагрузка следующего раздела»
      { rootMargin: '0px 0px 1200px 0px' },
    )

    io.observe(node)
    return () => io.disconnect()
  }, [count, total])

  // Переход по якорю — при загрузке страницы и при каждой смене хеша
  useEffect(() => {
    const handle = () => {
      const hash = window.location.hash
      const i = indexOfHash(hash)
      if (i === -1) return
      pendingScroll.current = decodeURIComponent(hash).replace(/^#/, '')
      reveal(i)
    }

    handle()
    window.addEventListener('hashchange', handle)
    return () => window.removeEventListener('hashchange', handle)
  }, [indexOfHash, reveal])

  // Прокрутка выполняется после того, как нужный раздел попал в DOM
  useLayoutEffect(() => {
    const key = pendingScroll.current
    if (!key) return
    const el = document.getElementById(key)
    if (!el) return // раздел ещё строится — вернёмся на следующем count
    pendingScroll.current = null

    let raf = 0
    let stopped = false
    let steady = 0

    const stop = () => {
      stopped = true
      cancelAnimationFrame(raf)
      window.removeEventListener('wheel', stop)
      window.removeEventListener('touchstart', stop)
      window.removeEventListener('keydown', stop)
    }

    /*
     * Доводим кадр до цели, пока она не перестанет уезжать.
     *
     * Две причины, по которым одного вызова мало. Первая: `behavior:
     * 'instant'` обязателен — в CSS стоит scroll-behavior: smooth, и
     * плавная прокрутка через двадцать пять тысяч пикселей просто не
     * успевает доехать, оставляя читателя на разделе раньше нужного.
     * Вторая: выше цели догружаются картинки и подменяются шрифты, и
     * вёрстка над ней ещё некоторое время шевелится.
     *
     * Любое действие читателя прекращает доводку — навязывать позицию
     * человеку, который уже сам крутит страницу, нельзя.
     */
    const settle = () => {
      if (stopped) return
      const top = el.getBoundingClientRect().top
      if (Math.abs(top) > 2) {
        el.scrollIntoView({ behavior: 'instant', block: 'start' })
        steady = 0
      } else {
        steady += 1
      }
      if (steady < 4) raf = requestAnimationFrame(settle)
      else stop()
    }

    window.addEventListener('wheel', stop, { passive: true, once: true })
    window.addEventListener('touchstart', stop, { passive: true, once: true })
    window.addEventListener('keydown', stop, { once: true })
    raf = requestAnimationFrame(settle)
    const timeout = setTimeout(stop, 2000)

    return () => {
      stop()
      clearTimeout(timeout)
    }
  }, [count])

  return { count, sentinelRef }
}
