import { memo } from 'react'
import type { Section } from '../data/types'
import './GlobalTimeline.css'

/** Метка раздела — та же логика, что и на боковой полосе. */
function mark(section: Section): string {
  const roman = section.part?.replace(/^ЧАСТЬ\s+/, '')
  if (roman) return roman
  return section.id === 'disputed' ? '?' : '✦'
}

/**
 * Обзорная лента: все разделы одной картой.
 *
 * Шкала намеренно не линейная. Между Частью I и Частью II — десятки
 * миллионов лет, между Частью V и VI — девять; на честной оси весь
 * Империум схлопнулся бы в одну точку. Поэтому разделы идут равными
 * полосами, а масштаб времени несут подписи эпох — и об этом прямо
 * сказано в примечании, чтобы карта никого не вводила в заблуждение.
 */
export const GlobalTimeline = memo(function GlobalTimeline({
  sections,
}: {
  sections: Section[]
}) {
  const total = sections.reduce((n, s) => n + s.events.length, 0)

  return (
    <section className="gt" id="chronology" aria-labelledby="gt-title">
      <header className="gt__head">
        <p className="gt__eyebrow">Обзор</p>
        <h2 className="gt__title" id="gt-title">
          Хронология
        </h2>
        <p className="gt__meta">{total} событий · от ~60 000 000 лет до н.э. до М42</p>
        <p className="gt__note">
          Шкала не линейная. Между первой и второй частью — десятки миллионов лет, между пятой и
          шестой — девять. На честной оси весь Империум схлопнулся бы в точку, поэтому масштаб
          времени несут подписи эпох, а не расстояние между полосами.
        </p>
      </header>

      <ol className="gt__bands">
        {sections.map((s, i) => (
          <li
            key={s.id}
            className="gt__row"
            style={
              {
                '--accent': s.accent,
                '--delay': `${Math.min(i * 0.04, 0.35)}s`,
              } as React.CSSProperties
            }
          >
            <a className={`gt__band${s.year === null ? ' is-timeless' : ''}`} href={`#${s.id}`}>
              <span className="gt__mark" aria-hidden="true">
                {mark(s)}
              </span>

              <span className="gt__text">
                <span className="gt__label">{s.navLabel}</span>
                <span className="gt__era">{s.era}</span>
              </span>

              <span className="gt__dots" aria-hidden="true">
                {s.events.length > 0 ? (
                  s.events.map((e) => (
                    <span
                      key={`${e.year}-${e.title}`}
                      className={`gt__dot${e.major ? ' is-major' : ''}`}
                      title={`${e.date} — ${e.title}`}
                    />
                  ))
                ) : (
                  <span className="gt__timeless">вне хронологии</span>
                )}
              </span>

              {/* Для скринридеров события перечисляются словами, а не точками */}
              <span className="visually-hidden">
                {s.events.length > 0
                  ? `${s.events.length} событий: ${s.events.map((e) => `${e.date}, ${e.title}`).join('; ')}`
                  : 'Раздел вне хронологии'}
              </span>
            </a>
          </li>
        ))}
      </ol>
    </section>
  )
})
