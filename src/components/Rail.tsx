import { useEffect, useId, useState } from 'react'
import { useMediaQuery } from '../hooks/useMediaQuery'
import type { Section } from '../data/types'
import './Rail.css'

interface RailProps {
  sections: Section[]
  activeId: string | null
  progress: number
  /** Положение бегунка на шкале: доля не по пикселям, а по разделам. */
  railPosition: number
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

export function Rail({
  sections,
  activeId,
  progress,
  railPosition,
  pinned,
  onPinnedChange,
}: RailProps) {
  const [hovered, setHovered] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const panelId = useId()

  /*
   * Раскрытие наведением — только там, где есть мышь. На тач-устройстве
   * касание тоже присылает mouseenter, и состояние наведения зависало:
   * панель не закрывалась после выбора раздела, потому что «курсор» с неё
   * формально так и не ушёл.
   */
  const touch = !useMediaQuery('(hover: hover)')

  const open = pinned || hovered || mobileOpen
  const activeEra = sections.find((s) => s.id === activeId)?.era ?? null

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
        onMouseEnter={() => !touch && setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/*
          Свёрнутая полоса. С мышью — только индикатор: клики по ней не
          принимаются, иначе после закрытия панели курсор остаётся над
          полосой и попадает по цифре, оказавшейся под ним случайно.
          На тач-устройстве наведения нет и панель сама не раскроется,
          поэтому там метки становятся ссылками — и полоса перестаёт быть
          скрытой от скринридера.
        */}
        <div className="rail__strip" aria-hidden={touch ? undefined : 'true'}>
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

          {/*
            Шкала прочитанного идёт вдоль римских цифр и ровно на их высоту.
            Раньше это была отдельная короткая полоска под ними: она честно
            показывала долю, но ни с чем не соотносилась — по ней нельзя
            было понять, докуда дочитал. Теперь заполненная часть
            останавливается напротив номера раздела, который сейчас на
            экране, и полоса читается как линейка, а не как украшение.
          */}
          <div className="rail__gauge">
            <div className="rail__gauge-row">
              <div
                className="rail__progress"
                role="progressbar"
                aria-label="Прочитано"
                aria-valuenow={Math.round(progress * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="rail__progress-fill"
                  style={{ height: `${railPosition * 100}%` }}
                />
              </div>

              <ul className="rail__marks">
                {sections.map((s) => {
                  const cls = `rail__mark${s.id === activeId ? ' is-active' : ''}`
                  const style = { '--accent': s.accent } as React.CSSProperties
                  // На тач-устройстве метка — ссылка: наведения там нет, и панель
                  // сама не раскроется. С мышью она остаётся индикатором, иначе
                  // после закрытия панели курсор попадает по случайной цифре.
                  return (
                    <li key={s.id}>
                      {touch ? (
                        <a href={`#${s.id}`} className={cls} style={style} title={s.navLabel}>
                          <span aria-hidden="true">{railMark(s)}</span>
                          <span className="visually-hidden">{s.navLabel}</span>
                        </a>
                      ) : (
                        <span className={cls} style={style}>
                          {railMark(s)}
                        </span>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>

          <span className="rail__percent">{Math.round(progress * 100)}</span>
        </div>

        {/*
          Панель не размонтируется, а прячется: так работают оба перехода —
          и появление, и исчезновение — на одном CSS-свойстве, без
          библиотеки анимаций. В закрытом виде visibility: hidden убирает
          её ссылки из обхода клавиатурой.
        */}
        <div id={panelId} className={`rail__panel${open ? ' is-open' : ''}`}>
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

          <p className="rail__hint">{Math.round(progress * 100)}% прочитано</p>
        </div>
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
