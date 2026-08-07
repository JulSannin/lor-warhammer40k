import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import { SkeletonTheme } from 'react-loading-skeleton'
import { GlobalTimeline } from './components/GlobalTimeline'
import { LightboxProvider } from './components/Lightbox'
import { Rail } from './components/Rail'
import { SectionView } from './components/SectionView'
import { WikiProvider } from './components/WikiCard'
import { useScrollSpy } from './hooks/useScrollSpy'
import { allImages, epigraph, heightBucket, sections, sectionHeights } from './data'
import './App.css'

export default function App() {
  const [pinned, setPinned] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const [listTop, setListTop] = useState(0)
  // Не сама ширина, а номер набора замеров: перерисовываться на каждый
  // пиксель ресайза незачем, высоты меняются только на границах
  const [bucket, setBucket] = useState(() => heightBucket(window.innerWidth))
  const heights = sectionHeights[bucket]

  /*
   * Виртуализация окна прокрутки.
   *
   * Разделы строятся, когда подходят к экрану, и разбираются, когда уходят
   * далеко, — в обе стороны, поэтому подгрузка идёт и вниз, и вверх. Высота
   * документа при этом задаётся заранее оценками из sectionHeights, так что
   * ползунок прокрутки не скачет: раньше документ рос по мере монтирования
   * и ползунок непрерывно сжимался.
   *
   * overscan: 1 — в памяти живут предыдущий, текущий и следующий разделы.
   * Меньше нельзя: сосед должен быть собран заранее, иначе он появлялся бы
   * прямо в кадре. Больше не нужно: раздел лора — это тысячи пикселей
   * высоты и до полудюжины картинок, и лишний запас окупается только
   * расходом памяти.
   *
   * Набор оценок зависит от ширины окна: от неё высота раздела зависит
   * сильно, и от одной таблицы на все ширины документ на телефоне уезжал
   * на десятую часть. Сбрасывать уже снятые измерения при смене ширины
   * не нужно — раздел перемеряется сам, когда снова попадает на экран.
   * Пробовал звать virtualizer.measure(): он перестраивается синхронно,
   * а ресайз приходит посреди отрисовки, и React ругался на flushSync.
   */
  const virtualizer = useWindowVirtualizer({
    count: sections.length,
    estimateSize: (i) => heights[i],
    overscan: 1,
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

  /*
   * Смена набора оценок — отдельно от замера отступа и следующим кадром.
   * Она двигает все разделы разом, наблюдатель размеров тут же сообщает
   * виртуализатору новые размеры, и прямо в обработчике ресайза это
   * приводило к flushSync посреди отрисовки — React на такое ругается.
   *
   * Отсрочка убирает почти все такие случаи, но не все: смена ширины
   * с переходом в самый узкий набор всё ещё даёт одно предупреждение
   * в консоли — flushSync зовёт сама библиотека из своего наблюдателя.
   * В прод-сборке React такие предупреждения не печатает, на поведение
   * это не влияет: положение разделов и высота документа после ресайза
   * верные.
   */
  useEffect(() => {
    let raf = 0
    const onResize = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => setBucket(heightBucket(window.innerWidth)))
    }
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
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

  /*
   * Шкала в боковой полосе. Два числа, потому что она отвечает сразу
   * на два вопроса.
   *
   * `passed` — сколько разделов позади: это тусклая заливка от начала
   * шкалы до цифры текущего раздела. `position` — то же плюс движение
   * внутри текущего раздела: яркий отрезок с бегунком на конце.
   *
   * Доля именно по разделам, а не по пикселям. Цифры на шкале
   * расставлены равномерно, а разделы разной длины — «Крестовый поход»
   * вчетверо длиннее «Главной мысли». На пиксельной доле бегунок
   * промахивался бы мимо активной цифры, и вся затея со шкалой-линейкой
   * рассыпалась бы.
   */
  const rail = useMemo(() => {
    const index = sections.findIndex((s) => s.id === activeId)
    if (index === -1) {
      const edge = progress < 0.5 ? 0 : 1
      return { passed: edge, position: edge }
    }

    const el = document.getElementById(sections[index].id)
    let within = 0
    if (el) {
      const rect = el.getBoundingClientRect()
      // Сколько ещё прокручивать до конца раздела. У раздела короче
      // экрана прокручивать нечего — считаем его пройденным сразу.
      const passable = rect.height - window.innerHeight
      if (passable > 0) within = Math.min(1, Math.max(0, -rect.top / passable))
    }
    return {
      passed: index / sections.length,
      position: (index + within) / sections.length,
    }
  }, [activeId, progress])

  /**
   * Перейти к разделу, не оставляя якорь в адресной строке.
   *
   * Одного вызова мало. Высоты разделов известны заранее только для
   * ширины, на которой их замеряли; на другой ширине оценки расходятся
   * с настоящими размерами, и позиция цели уезжает, пока виртуализатор
   * домеряет разделы выше неё. Поэтому доводим кадр до цели, пока она не
   * перестанет двигаться, и останавливаемся, если читатель начал крутить
   * страницу сам — навязывать ему позицию нельзя.
   */
  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= sections.length) return
      virtualizer.scrollToIndex(index, { align: 'start' })

      let raf = 0
      let stopped = false
      let steady = 0
      const deadline = performance.now() + 2500

      const stop = () => {
        stopped = true
        cancelAnimationFrame(raf)
        window.removeEventListener('wheel', stop)
        window.removeEventListener('touchstart', stop)
        window.removeEventListener('keydown', stop)
      }

      const settle = () => {
        if (stopped) return
        if (performance.now() > deadline) return stop()

        const el = document.getElementById(sections[index].id)
        if (!el) {
          // Раздел ещё не построен — просим виртуализатор ещё раз
          virtualizer.scrollToIndex(index, { align: 'start' })
          steady = 0
        } else if (Math.abs(el.getBoundingClientRect().top) > 4) {
          el.scrollIntoView({ behavior: 'instant', block: 'start' })
          steady = 0
        } else {
          steady += 1
        }

        if (steady < 5) raf = requestAnimationFrame(settle)
        else stop()
      }

      window.addEventListener('wheel', stop, { passive: true, once: true })
      window.addEventListener('touchstart', stop, { passive: true, once: true })
      window.addEventListener('keydown', stop, { once: true })
      raf = requestAnimationFrame(settle)
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
      <WikiProvider>
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
              rail={rail}
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
      </WikiProvider>
    </SkeletonTheme>
  )
}
