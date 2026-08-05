import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import Skeleton from 'react-loading-skeleton'
import type { SectionImage } from '../data/types'
import { LightboxContext, useLightbox } from './lightbox-context'
import 'react-loading-skeleton/dist/skeleton.css'
import './Lightbox.css'

/**
 * Кадр в попапе.
 *
 * Файл тот же, что и на странице, — скачан шириной 1600px, чего хватает
 * обоим. Скелетон всё равно нужен: на странице кадр обрезан по пропорции
 * и показан уменьшенным, а в попапе браузер декодирует картинку целиком,
 * и на слабой машине это занимает заметное время.
 */
function LightboxImage({ image }: { image: SectionImage }) {
  const [loaded, setLoaded] = useState(false)

  // Сбрасываем состояние при переходе к соседней картинке
  useEffect(() => setLoaded(false), [image.src])

  return (
    <span className={`lb__frame${loaded ? ' is-loaded' : ''}`}>
      {!loaded && (
        <span className="lb__skeleton" aria-hidden="true">
          <Skeleton height="100%" width="100%" borderRadius={0} />
        </span>
      )}
      <img
        src={image.src}
        alt={image.alt}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
      />
    </span>
  )
}

export function LightboxProvider({
  images,
  children,
}: {
  images: SectionImage[]
  children: ReactNode
}) {
  const [index, setIndex] = useState<number | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const restoreRef = useRef<HTMLElement | null>(null)

  const open = useCallback(
    (src: string) => {
      const i = images.findIndex((img) => img.src === src)
      if (i === -1) return
      restoreRef.current = document.activeElement as HTMLElement | null
      setIndex(i)
    },
    [images],
  )

  const close = useCallback(() => {
    setIndex(null)
    // Возвращаем фокус туда, откуда открыли, — иначе он падает в начало страницы
    restoreRef.current?.focus?.()
  }, [])

  const step = useCallback(
    (delta: number) =>
      setIndex((i) => (i === null ? i : (i + delta + images.length) % images.length)),
    [images.length],
  )

  const isOpen = index !== null

  useEffect(() => {
    if (!isOpen) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowRight') step(1)
      else if (e.key === 'ArrowLeft') step(-1)
      else if (e.key === 'Tab') {
        // Простая ловушка фокуса: в попапе всего три кнопки
        const focusable = document.querySelectorAll<HTMLElement>('.lb [data-focusable]')
        if (focusable.length === 0) return
        const list = [...focusable]
        const first = list[0]
        const last = list[list.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    // Блокируем прокрутку фона, компенсируя ширину полосы прокрутки,
    // чтобы страница под попапом не дёргалась
    const bar = window.innerWidth - document.documentElement.clientWidth
    const prevOverflow = document.body.style.overflow
    const prevPad = document.body.style.paddingRight
    document.body.style.overflow = 'hidden'
    if (bar > 0) document.body.style.paddingRight = `${bar}px`

    window.addEventListener('keydown', onKey)
    closeRef.current?.focus()

    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      document.body.style.paddingRight = prevPad
    }
  }, [isOpen, close, step])

  const api = useMemo(() => ({ open }), [open])
  const current = index === null ? null : images[index]

  return (
    <LightboxContext.Provider value={api}>
      {children}

      {current && (
        <div
          className="lb"
          role="dialog"
          aria-modal="true"
          aria-label={current.alt}
          onClick={(e) => {
            if (e.target === e.currentTarget) close()
          }}
        >
          <button
            type="button"
            className="lb__close"
            onClick={close}
            ref={closeRef}
            data-focusable
          >
            <span aria-hidden="true">✕</span>
            <span className="visually-hidden">Закрыть</span>
          </button>

          {images.length > 1 && (
            <button
              type="button"
              className="lb__nav lb__nav--prev"
              onClick={() => step(-1)}
              data-focusable
            >
              <span aria-hidden="true">‹</span>
              <span className="visually-hidden">Предыдущее изображение</span>
            </button>
          )}

          <figure className="lb__figure" key={current.src}>
            <LightboxImage image={current} />
            <figcaption>
              <span className="lb__caption">{current.caption}</span>
              <span className="lb__counter">
                {(index ?? 0) + 1} / {images.length}
              </span>
            </figcaption>
          </figure>

          {images.length > 1 && (
            <button
              type="button"
              className="lb__nav lb__nav--next"
              onClick={() => step(1)}
              data-focusable
            >
              <span aria-hidden="true">›</span>
              <span className="visually-hidden">Следующее изображение</span>
            </button>
          )}
        </div>
      )}
    </LightboxContext.Provider>
  )
}

/**
 * Картинка, открывающая попап по клику. Используется и в шапке, и по тексту.
 *
 * До загрузки на месте кадра стоит скелетон, а сама картинка проявляется
 * плавно. Место под кадр зарезервировано пропорцией в CSS, поэтому вёрстка
 * не прыгает, — но без этого картинки возникали рывком, и на прокрутке это
 * читалось как дёрганье.
 */
export function ZoomableImage({
  image,
  className,
}: {
  image: SectionImage
  className?: string
}) {
  const { open } = useLightbox()
  const ref = useRef<HTMLImageElement>(null)
  const [loaded, setLoaded] = useState(false)

  // Картинка из кеша может успеть загрузиться до навешивания onLoad
  useEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth > 0) setLoaded(true)
  }, [])

  return (
    <button
      type="button"
      className={`zoom${className ? ` ${className}` : ''}${loaded ? ' is-loaded' : ''}`}
      onClick={() => open(image.src)}
      aria-label={`Открыть изображение: ${image.alt}`}
    >
      {!loaded && (
        <span className="zoom__skeleton" aria-hidden="true">
          <Skeleton height="100%" width="100%" borderRadius={0} />
        </span>
      )}
      <img
        ref={ref}
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
      />
      <span className="zoom__hint" aria-hidden="true">
        ⤢
      </span>
    </button>
  )
}
