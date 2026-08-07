import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { wiki } from '../data'
import type { WikiArticle } from '../data/types'
import { useModal } from '../hooks/useModal'
import { WikiContext, useWiki } from './wiki-context'
import './WikiCard.css'

const WIKI = 'https://warhammer40k.fandom.com/ru/wiki/'

/** Адрес статьи выводится из названия, а не хранится: экономит 10 КБ данных. */
const articleUrl = (title: string) => WIKI + encodeURIComponent(title.replace(/ /g, '_'))

/**
 * Одна статья внутри карточки.
 *
 * Раскладка выбирается по форме картинки, а не одна на всех. Из полутора
 * сотен заглавных картинок вики больше половины вертикальные: портреты
 * примархов, богов, персонажей. Общая широкая рамка резала их по глазам,
 * поэтому вертикальные встают колонкой сбоку от текста, а горизонтальные —
 * полосой сверху, как и положено пейзажу.
 */
function Article({ article }: { article: WikiArticle }) {
  const showImage = !!article.thumb
  const portrait = showImage && article.thumbHeight! > article.thumbWidth! * 1.15
  // У двух десятков статей картинка мельче рамки. Растягивать её нельзя —
  // выходит мыло, поэтому такие показываем в их собственном размере.
  const small = showImage && Math.max(article.thumbWidth!, article.thumbHeight!) < 560

  return (
    <div
      className={`wc__article wc__article--${showImage ? (portrait ? 'side' : 'top') : 'bare'}`}
    >
      {showImage && (
        <img
          className={`wc__thumb${article.lightThumb ? ' wc__thumb--light' : ''}${
            small ? ' wc__thumb--small' : ''
          }`}
          src={`./img/wiki/${article.thumb}`}
          alt=""
          width={article.thumbWidth}
          height={article.thumbHeight}
          decoding="async"
        />
      )}

      <div className="wc__body">
        <h2 className="wc__title">{article.title}</h2>
        <p className="wc__extract">{article.extract}</p>
        <a
          className="wc__link"
          href={articleUrl(article.title)}
          target="_blank"
          rel="noopener noreferrer"
          data-focusable
        >
          Читать статью целиком
          <span aria-hidden="true"> ↗</span>
        </a>
      </div>
    </div>
  )
}

/**
 * Карточка со статьями русской вики.
 *
 * Показывает первый абзац и заглавную картинку — то, что успело снять
 * при сборке. Это не фрейм: Fandom запрещает встраивать свои страницы
 * заголовком X-Frame-Options, и обойти его без своего сервера нельзя.
 * Карточка вместо фрейма даже удобнее — она в той же типографике, что
 * и остальной сайт, и открывается мгновенно.
 *
 * Статей может быть несколько: «стазис-гробницы» — это и стазис,
 * и некроны. Тогда сверху появляются переключатели.
 */
export function WikiProvider({ children }: { children: ReactNode }) {
  const [term, setTerm] = useState<string | null>(null)
  const [tab, setTab] = useState(0)
  const closeRef = useRef<HTMLButtonElement>(null)
  const restoreRef = useRef<HTMLElement | null>(null)

  const open = useCallback((next: string) => {
    if (!(next in wiki)) return
    restoreRef.current = document.activeElement as HTMLElement | null
    setTerm(next)
    setTab(0)
  }, [])

  const close = useCallback(() => {
    setTerm(null)
    // Возвращаем фокус на термин, с которого открыли, — иначе он падает
    // в начало страницы, и читатель теряет место в тексте
    restoreRef.current?.focus?.()
  }, [])

  useModal({ open: term !== null, onClose: close, root: '.wc', focusRef: closeRef })

  const api = useMemo(() => ({ open }), [open])
  const articles = term === null ? null : wiki[term]
  // Ширина окна зависит от того, есть ли у открытой статьи картинка:
  // тексту без картинки широкая колонка только вредит
  const active = articles?.[Math.min(tab, articles.length - 1)]

  return (
    <WikiContext.Provider value={api}>
      {children}

      {articles && articles.length > 0 && (
        <div
          className="wc"
          role="dialog"
          aria-modal="true"
          aria-label={`Справка: ${term}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) close()
          }}
        >
          <article className={`wc__card${active?.thumb ? '' : ' wc__card--bare'}`}>
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

            <p className="wc__source">Русская вики Warhammer 40,000</p>

            {articles.length > 1 && (
              <div className="wc__tabs" role="tablist" aria-label="Статьи по термину">
                {articles.map((a, i) => (
                  <button
                    key={a.title}
                    type="button"
                    role="tab"
                    aria-selected={i === tab}
                    className={`wc__tab${i === tab ? ' is-active' : ''}`}
                    onClick={() => setTab(i)}
                    data-focusable
                  >
                    {a.title}
                  </button>
                ))}
              </div>
            )}

            {active && <Article article={active} />}
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

/**
 * Всплывающая справка при наведении — для карточек примархов.
 *
 * Отдельно от модального окна: галерею просматривают глазами, и
 * останавливать это окном на каждый портрет было бы навязчиво.
 * Картинка тут не нужна — портрет читатель и так видит перед собой.
 *
 * Появляется и по фокусу с клавиатуры, а на устройствах без мыши,
 * где наведения не существует, — по касанию.
 */
export function WikiHoverCard({ term, children }: { term: string; children: ReactNode }) {
  const articles = wiki[term]
  const [shown, setShown] = useState(false)
  const hostRef = useRef<HTMLDivElement>(null)
  const popRef = useRef<HTMLDivElement>(null)
  const [place, setPlace] = useState<{ up: boolean; max?: number }>({ up: false })

  /*
   * Подсказка раскрывается вниз, а у нижнего края экрана — вверх.
   *
   * Высота меряется у настоящего элемента, а не прикидывается: справки
   * разной длины, и с прикидкой в 260 пикселей подсказка у длинной
   * статьи всё равно уезжала за нижний край. Если места не хватает
   * ни сверху, ни снизу — выбираем сторону просторнее и ограничиваем
   * подсказку по ней, чтобы она не вылезала за экран вовсе.
   */
  useLayoutEffect(() => {
    if (!shown || !popRef.current || !hostRef.current) return
    const host = hostRef.current.getBoundingClientRect()
    const needed = popRef.current.scrollHeight + 12
    const below = window.innerHeight - host.bottom
    const above = host.top
    const up = below < needed && above > below
    const room = (up ? above : below) - 12
    setPlace({ up, max: needed > room ? Math.max(room, 120) : undefined })
  }, [shown])

  useEffect(() => {
    if (!shown) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setShown(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [shown])

  if (!articles?.length) return <>{children}</>

  return (
    <div
      ref={hostRef}
      className="wh"
      onMouseEnter={() => setShown(true)}
      onMouseLeave={() => setShown(false)}
      onFocus={() => setShown(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setShown(false)
      }}
    >
      {children}
      {shown && (
        <div
          ref={popRef}
          className={`wh__pop${place.up ? ' wh__pop--up' : ''}`}
          style={place.max ? { maxHeight: place.max, overflowY: 'auto' } : undefined}
          role="tooltip"
        >
          {articles.map((a) => (
            <div className="wh__item" key={a.title}>
              <p className="wh__title">{a.title}</p>
              <p className="wh__extract">{a.extract}</p>
            </div>
          ))}
          <a
            className="wh__link"
            href={articleUrl(articles[0].title)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Читать на вики ↗
          </a>
        </div>
      )}
    </div>
  )
}
