import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { SectionImage } from '../data/types'
import { LightboxContext, useLightbox } from './lightbox-context'
import './Lightbox.css'

/**
 * Fandom отдаёт уменьшенные копии по ширине в самом URL. В попапе
 * запрашиваем 2560px: CDN не растягивает — если оригинал меньше,
 * вернётся оригинал.
 */
function fullSize(src: string): string {
  return src.replace(/\/scale-to-width-down\/\d+/, '/scale-to-width-down/2560')
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
    (delta: number) => setIndex((i) => (i === null ? i : (i + delta + images.length) % images.length)),
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

      <AnimatePresence>
        {current && (
          <motion.div
            className="lb"
            role="dialog"
            aria-modal="true"
            aria-label={current.alt}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
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

            <motion.figure
              className="lb__figure"
              key={current.src}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <img
                src={fullSize(current.src)}
                alt={current.alt}
                referrerPolicy="no-referrer"
                decoding="async"
              />
              <figcaption>
                <span className="lb__caption">{current.caption}</span>
                <span className="lb__counter">
                  {(index ?? 0) + 1} / {images.length}
                </span>
              </figcaption>
            </motion.figure>

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
          </motion.div>
        )}
      </AnimatePresence>
    </LightboxContext.Provider>
  )
}

/** Картинка, открывающая попап по клику. Используется и в шапке, и по тексту. */
export function ZoomableImage({
  image,
  className,
}: {
  image: SectionImage
  className?: string
}) {
  const { open } = useLightbox()

  return (
    <button
      type="button"
      className={`zoom${className ? ` ${className}` : ''}`}
      onClick={() => open(image.src)}
      aria-label={`Открыть изображение: ${image.alt}`}
    >
      <img
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
      />
      <span className="zoom__hint" aria-hidden="true">
        ⤢
      </span>
    </button>
  )
}
