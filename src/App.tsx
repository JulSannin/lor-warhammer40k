import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import { SkeletonTheme } from 'react-loading-skeleton'
import { GlobalTimeline } from './components/GlobalTimeline'
import { LightboxProvider } from './components/Lightbox'
import { Rail } from './components/Rail'
import { SectionView } from './components/SectionView'
import { useScrollSpy } from './hooks/useScrollSpy'
import { allImages, epigraph, sections, sectionHeights } from './data'
import './App.css'

export default function App() {
  const [pinned, setPinned] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const [listTop, setListTop] = useState(0)

  /*
   * Виртуализация окна прокрутки.
   *
   * Разделы строятся, когда подходят к экрану, и разбираются, когда уходят
   * далеко, — в обе стороны, поэтому подгрузка идёт и вниз, и вверх. Высота
   * документа при этом задаётся заранее оценками из sectionHeights, так что
   * ползунок прокрутки не скачет: раньше документ рос по мере монтирования
   * и ползунок непрерывно сжимался.
   */
  const virtualizer = useWindowVirtualizer({
    count: sections.length,
    estimateSize: (i) => sectionHeights[i],
    overscan: 2,
    scrollMargin: listTop,
  })

  // scrollMargin — расстояние от верха документа до списка разделов
  // (титульный экран плюс обзорная хронология). Меняется при ресайзе.
  useLayoutEffect(() => {
    const measure = () => setListTop(listRef.current?.offsetTop ?? 0)
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const items = virtualizer.getVirtualItems()

  const visibleIds = useMemo(
    () => items.map((i) => sections[i.index].id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items.map((i) => i.index).join(',')],
  )

  const activeId = useScrollSpy(visibleIds)

  /*
   * Доля прочитанного — обычная пиксельная, и теперь она честная: высота
   * документа задана оценками заранее и по ходу чтения не растёт. До
   * виртуализации так считать было нельзя, потому что документ достраивался
   * на ходу и низ страницы показывал сто процентов при двух разделах в DOM.
   */
  const totalSize = virtualizer.getTotalSize()
  const progress = useMemo(() => {
    // Нижняя граница по оценкам виртуализатора — на случай, если браузер
    // ещё не пересчитал высоту документа после смены набора разделов
    const docHeight = Math.max(document.documentElement.scrollHeight, listTop + totalSize)
    const scrollable = docHeight - window.innerHeight
    if (scrollable <= 0) return 0
    return Math.min(1, Math.max(0, (virtualizer.scrollOffset ?? 0) / scrollable))
  }, [virtualizer.scrollOffset, totalSize, listTop])

  /** Перейти к разделу, не оставляя якорь в адресной строке. */
  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= sections.length) return
      virtualizer.scrollToIndex(index, { align: 'start' })
      // Виртуализатор может промахнуться, пока не измерил реальные высоты
      // разделов выше цели, — повторяем, пока позиция не устоится
      let tries = 0
      const retry = () => {
        if (tries++ > 12) return
        const el = document.getElementById(sections[index].id)
        if (!el) {
          virtualizer.scrollToIndex(index, { align: 'start' })
        } else if (Math.abs(el.getBoundingClientRect().top) > 4) {
          el.scrollIntoView({ behavior: 'instant', block: 'start' })
        } else {
          return
        }
        requestAnimationFrame(retry)
      }
      requestAnimationFrame(retry)
    },
    [virtualizer],
  )

  /*
   * Все ссылки на разделы обрабатываются здесь, а не браузером: переход
   * выполняется прокруткой, а якорь в адресную строку не пишется. Иначе
   * после выбора раздела перезагрузка страницы утаскивала бы обратно.
   * Средний клик и клик с модификаторами не трогаем — пусть открывают
   * в новой вкладке как обычная ссылка.
   */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const target = e.target as HTMLElement | null
      const link = target?.closest?.('a[href^="#"]') as HTMLAnchorElement | null
      if (!link) return
      const key = decodeURIComponent(link.getAttribute('href') ?? '').slice(1)
      const index = sections.findIndex((s) => s.id === key || s.anchor === key)
      if (index === -1) return
      e.preventDefault()
      goTo(index)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [goTo])

  /*
   * Ссылка со стороны с якорем всё ещё открывает нужный раздел, но сразу
   * после перехода якорь из адреса убирается — чтобы перезагрузка оставляла
   * читателя на месте, а не возвращала к началу раздела.
   */
  useEffect(() => {
    const key = decodeURIComponent(window.location.hash).replace(/^#/, '')
    if (!key) return
    const index = sections.findIndex((s) => s.id === key || s.anchor === key)
    if (index === -1) return
    history.replaceState(null, '', window.location.pathname + window.location.search)
    requestAnimationFrame(() => goTo(index))
  }, [goTo])

  return (
    <SkeletonTheme baseColor="#17140f" highlightColor="#241f18" duration={1.6}>
      <LightboxProvider images={allImages}>
        <div className={`app${pinned ? ' app--pinned' : ''}`}>
          {/*
            Обход навигации — первым в порядке обхода, иначе с клавиатуры
            до текста придётся пройти тринадцать остановок в боковой
            панели. Ссылка не видна, пока на неё не встал фокус.
          */}
          <a className="skip-link" href="#содержание">
            Перейти к содержанию
          </a>

          <Rail
            sections={sections}
            activeId={activeId}
            progress={progress}
            pinned={pinned}
            onPinnedChange={setPinned}
          />

          <main className="app__content" id="содержание" tabIndex={-1}>
            <header className="intro">
              <p className="intro__eyebrow">В мрачной тьме далёкого будущего</p>
              <h1 className="intro__title">
                Краткий лор
                <br />
                Warhammer 40K
              </h1>
              {epigraph && (
                <p className="intro__epigraph">{epigraph.replace(/^\*|\*$/g, '')}</p>
              )}
            </header>

            <GlobalTimeline sections={sections} />

            <div
              ref={listRef}
              className="sections"
              style={{ height: totalSize, position: 'relative' }}
            >
              {items.map((item) => (
                <div
                  key={item.key}
                  data-index={item.index}
                  ref={virtualizer.measureElement}
                  className="sections__slot"
                  style={{ transform: `translateY(${item.start - listTop}px)` }}
                >
                  <SectionView section={sections[item.index]} />
                </div>
              ))}
            </div>

            <footer className="outro">
              <p>
                Warhammer 40,000 и все связанные названия, персонажи и изображения —
                собственность Games Workshop Ltd. Некоммерческий фанатский проект.
              </p>
            </footer>
          </main>
        </div>
      </LightboxProvider>
    </SkeletonTheme>
  )
}
