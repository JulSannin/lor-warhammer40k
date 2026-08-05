import { useEffect, useId, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { Section } from '../data/types'
import './Rail.css'

interface RailProps {
  sections: Section[]
  activeId: string | null
  progress: number
  /** Панель закреплена — контент сдвигается, а не перекрывается. */
  pinned: boolean
  onPinnedChange: (pinned: boolean) => void
}

/**
 * Метка раздела на свёрнутой полосе.
 *
 * Части I–IX пронумерованы в самом лоре, поэтому берём их номер оттуда.
 * «Главная мысль» и «Спорные места» частями не являются — рисовать им
 * «X» и «XI» значило бы выдумывать нумерацию, которой в источнике нет.
 */
function railMark(section: Section): string {
  const roman = section.part?.replace(/^ЧАСТЬ\s+/, '')
  if (roman) return roman
  return section.id === 'disputed' ? '?' : '✦'
}

export function Rail({ sections, activeId, progress, pinned, onPinnedChange }: RailProps) {
  const [hovered, setHovered] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const panelId = useId()

  const open = pinned || hovered || mobileOpen

  // Escape закрывает панель — и раскрытую наведением, и закреплённую.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setHovered(false)
      setMobileOpen(false)
      onPinnedChange(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onPinnedChange])

  const go = () => {
    setHovered(false)
    setMobileOpen(false)
  }

  return (
    <>
      <button
        type="button"
        className="rail-burger"
        aria-expanded={mobileOpen}
        aria-controls={panelId}
        onClick={() => setMobileOpen((v) => !v)}
      >
        <span aria-hidden="true">{mobileOpen ? '✕' : '☰'}</span>
        <span className="visually-hidden">
          {mobileOpen ? 'Закрыть навигацию' : 'Открыть навигацию'}
        </span>
      </button>

      <nav
        className={`rail${open ? ' rail--open' : ''}`}
        aria-label="Разделы"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Свёрнутая полоса: номера частей и полоса прочитанного */}
        <div className="rail__strip" aria-hidden={open ? 'true' : undefined}>
          <span className="rail__brand">40K</span>

          <ul className="rail__marks">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className={`rail__mark${s.id === activeId ? ' is-active' : ''}`}
                  style={{ '--accent': s.accent } as React.CSSProperties}
                  tabIndex={open ? -1 : 0}
                  title={s.navLabel}
                >
                  <span aria-hidden="true">{railMark(s)}</span>
                  <span className="visually-hidden">{s.navLabel}</span>
                </a>
              </li>
            ))}
          </ul>

          <div
            className="rail__progress"
            role="progressbar"
            aria-label="Прочитано"
            aria-valuenow={Math.round(progress * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="rail__progress-fill" style={{ height: `${progress * 100}%` }} />
          </div>

          <span className="rail__percent">{Math.round(progress * 100)}</span>
        </div>

        {/* Раскрытая панель */}
        <AnimatePresence>
          {open && (
            <motion.div
              id={panelId}
              className="rail__panel"
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="rail__panel-head">
                <p className="rail__panel-title">
                  Весь лор
                  <br />
                  Warhammer 40,000
                </p>
                <button
                  type="button"
                  className={`rail__pin${pinned ? ' is-pinned' : ''}`}
                  aria-pressed={pinned}
                  onClick={() => onPinnedChange(!pinned)}
                >
                  <span aria-hidden="true">{pinned ? '◉' : '○'}</span>
                  <span className="visually-hidden">
                    {pinned ? 'Открепить панель' : 'Закрепить панель'}
                  </span>
                </button>
              </div>

              <ol className="rail__list">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className={`rail__item${s.id === activeId ? ' is-active' : ''}`}
                      style={{ '--accent': s.accent } as React.CSSProperties}
                      aria-current={s.id === activeId ? 'true' : undefined}
                      onClick={go}
                    >
                      <span className="rail__item-mark" aria-hidden="true">
                        {railMark(s)}
                      </span>
                      <span className="rail__item-text">
                        <span className="rail__item-label">{s.navLabel}</span>
                        <span className="rail__item-era">{s.era}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ol>

              <p className="rail__hint">
                {Math.round(progress * 100)}% прочитано
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {mobileOpen && (
        <button
          type="button"
          className="rail__scrim"
          aria-label="Закрыть навигацию"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  )
}
