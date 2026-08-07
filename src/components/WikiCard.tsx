import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { wiki } from '../data'
import { useModal } from '../hooks/useModal'
import { WikiContext, useWiki } from './wiki-context'
import './WikiCard.css'

const WIKI = 'https://warhammer40k.fandom.com/ru/wiki/'

/** Адрес статьи выводится из названия, а не хранится: экономит 10 КБ данных. */
const articleUrl = (title: string) => WIKI + encodeURIComponent(title.replace(/ /g, '_'))

/**
 * Карточка статьи с русской вики.
 *
 * Показывает первый абзац и заглавную картинку — то, что успело
 * снять при сборке. Это не фрейм: Fandom запрещает встраивать свои
 * страницы заголовком X-Frame-Options, и обойти его без своего
 * сервера нельзя. Карточка вместо фрейма даже удобнее — она в той же
 * типографике, что и остальной сайт, и открывается мгновенно.
 */
export function WikiProvider({ children }: { children: ReactNode }) {
  const [term, setTerm] = useState<string | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const restoreRef = useRef<HTMLElement | null>(null)

  const open = useCallback((next: string) => {
    if (!(next in wiki)) return
    restoreRef.current = document.activeElement as HTMLElement | null
    setTerm(next)
  }, [])

  const close = useCallback(() => {
    setTerm(null)
    // Возвращаем фокус на термин, с которого открыли, — иначе он падает
    // в начало страницы, и читатель теряет место в тексте
    restoreRef.current?.focus?.()
  }, [])

  useModal({ open: term !== null, onClose: close, root: '.wc', focusRef: closeRef })

  const api = useMemo(() => ({ open }), [open])
  const entry = term === null ? null : wiki[term]

  /*
   * Раскладка выбирается по форме картинки, а не одна на всех.
   * Из 149 заглавных картинок вики 87 вертикальные: портреты примархов,
   * богов, персонажей. Общая широкая рамка резала их по глазам, поэтому
   * вертикальные встают колонкой сбоку от текста, а горизонтальные —
   * полосой сверху, как и положено пейзажу.
   */
  const portrait = !!entry?.thumb && entry.thumbHeight! > entry.thumbWidth! * 1.15

  /*
   * У двух десятков статей заглавная картинка мельче, чем рамка карточки.
   * Растягивать её нельзя — выходит мыло, поэтому такие показываем в их
   * собственном размере по центру рамки.
   */
  const smallThumb = !!entry?.thumb && Math.max(entry.thumbWidth!, entry.thumbHeight!) < 560

  return (
    <WikiContext.Provider value={api}>
      {children}

      {entry && (
        <div
          className="wc"
          role="dialog"
          aria-modal="true"
          aria-labelledby="wc-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) close()
          }}
        >
          <article
            className={`wc__card wc__card--${portrait ? 'side' : 'top'}${
              entry.thumb ? '' : ' wc__card--bare'
            }`}
          >
            <button
              type="button"
              className="wc__close"
              onClick={close}
              ref={closeRef}
              data-focusable
            >
              <span aria-hidden="true">✕</span>
              <span className="visually-hidden">Закрыть</span>
            </button>

            {entry.thumb && (
              <img
                className={`wc__thumb${entry.lightThumb ? ' wc__thumb--light' : ''}${
                  smallThumb ? ' wc__thumb--small' : ''
                }`}
                src={`./img/wiki/${entry.thumb}`}
                alt=""
                width={entry.thumbWidth}
                height={entry.thumbHeight}
                decoding="async"
              />
            )}

            <div className="wc__body">
              <p className="wc__source">Русская вики Warhammer 40,000</p>
              <h2 className="wc__title" id="wc-title">
                {entry.title}
              </h2>
              <p className="wc__extract">{entry.extract}</p>
              <a
                className="wc__link"
                href={articleUrl(entry.title)}
                target="_blank"
                rel="noopener noreferrer"
                data-focusable
              >
                Читать статью целиком
                <span aria-hidden="true"> ↗</span>
              </a>
            </div>
          </article>
        </div>
      )}
    </WikiContext.Provider>
  )
}

/**
 * Выделенный термин, открывающий карточку.
 *
 * Это кнопка, а не ссылка: клик открывает окно на той же странице,
 * а не ведёт по адресу. Ссылка на саму вики есть внутри карточки —
 * там же, где ей и место.
 */
export function WikiTerm({ term }: { term: string }) {
  const { open } = useWiki()
  return (
    <button type="button" className="wiki-term" onClick={() => open(term)}>
      {term}
      <span className="visually-hidden"> — открыть справку</span>
    </button>
  )
}
