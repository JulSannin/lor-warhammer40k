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
  const activeEra = sections.find((s) => s.id === activeId)?.era ?? null

  /*
   * Раскрытие наведением — только там, где есть мышь. На тач-устройстве
   * касание тоже присылает mouseenter, и состояние наведения зависало:
   * панель не закрывалась после выбора раздела, потому что «курсор» с неё
   * формально так и не ушёл.
   */
  const canHover = () =>
    typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches

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

  /*
   * Выбор раздела не закрывает панель на десктопе: она раскрыта наведением
   * и должна закрыться, когда с неё увели курсор, — иначе после клика она
   * схлопывается под курсором и следующий выбор требует нового наведения.
   * На мобильной панель перекрывает страницу, поэтому там закрываем.
   */
  const go = () => setMobileOpen(false)

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
        onMouseEnter={() => canHover() && setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/*
          Свёрнутая полоса — только индикатор: номер текущей части и доля
          прочитанного. Кликать по ней нельзя, иначе после закрытия панели
          курсор остаётся над полосой и попадает по цифре, которая оказалась
          под ним случайно. Переходы делаются из раскрытой панели.
        */}
        <div className="rail__strip" aria-hidden="true">
          {/* Единственная точка входа с клавиатуры и с тача */}
          <button
            type="button"
            className="rail__brand"
            aria-hidden={open ? 'true' : undefined}
            tabIndex={open ? -1 : 0}
            onFocus={() => setHovered(true)}
            onClick={() => onPinnedChange(!pinned)}
          >
            <span aria-hidden="true">40K</span>
            <span className="visually-hidden">Открыть список разделов</span>
          </button>

          <ul className="rail__marks">
            {sections.map((s) => (
              <li key={s.id}>
                <span
                  className={`rail__mark${s.id === activeId ? ' is-active' : ''}`}
                  style={{ '--accent': s.accent } as React.CSSProperties}
                >
                  {railMark(s)}
                </span>
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
                  Краткий лор
                  <br />
                  Warhammer 40K
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

              {/*
                Компактная шкала «где я во времени». Засечки стоят равномерно,
                а не по годам: линейная ось растянула бы шестьдесят миллионов
                лет и схлопнула бы весь Империум в точку. Масштаб несёт подпись.
              */}
              <div className="rail__axis">
                <div className="rail__axis-track" aria-hidden="true">
                  {sections.map((s) => (
                    <span
                      key={s.id}
                      className={
                        'rail__axis-tick' +
                        (s.id === activeId ? ' is-active' : '') +
                        (s.year === null ? ' is-timeless' : '')
                      }
                      style={{ '--accent': s.accent } as React.CSSProperties}
                    />
                  ))}
                </div>
                <p className="rail__axis-caption">
                  <span>~60 млн до н.э.</span>
                  <span>М42</span>
                </p>
                {activeEra && <p className="rail__axis-now">{activeEra}</p>}
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
