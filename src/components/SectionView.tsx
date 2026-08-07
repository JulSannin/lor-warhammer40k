import { memo } from 'react'
import type { Section } from '../data/types'
import { Blocks } from './Blocks'
import { ZoomableImage } from './Lightbox'
import { Timeline } from './Timeline'
import './SectionView.css'

/** `(005.М31 — 014.М31)` и `005.М31 — 014.М31` — одно и то же. */
const sameDates = (a: string, b: string) =>
  a.replace(/[()\s]/g, '') === b.replace(/[()\s]/g, '')

/*
 * Обёрнут в memo не ради красоты: виртуализатор обновляет своё состояние
 * на каждом кадре прокрутки, из-за чего перерисовывался App, а вместе с
 * ним React заново сверял дерево всех смонтированных разделов — а это
 * полторы тысячи узлов. Раздел зависит только от своих данных, ссылка на
 * которые постоянна, поэтому memo обрывает эту работу целиком.
 */
export const SectionView = memo(function SectionView({ section }: { section: Section }) {
  // Датировка из markdown у всех разделов, где она есть, дословно повторяет
  // эпоху в шапке — показываем её, только если она добавляет что-то новое.
  const subtitle =
    section.subtitle && !sameDates(section.subtitle, section.era) ? section.subtitle : null

  return (
    <section
      id={section.id}
      className="section"
      style={{ '--accent': section.accent } as React.CSSProperties}
      aria-labelledby={`${section.id}-title`}
    >
      {/* Псевдоним для якорей вида #часть-v-ересь-хоруса из исходного лора */}
      <span id={section.anchor} className="section__anchor" aria-hidden="true" />

      <header className="section__head">
        <p className="section__eyebrow">
          <span className="section__part">{section.part ?? `Раздел ${section.index}`}</span>
          <span className="section__era">{section.era}</span>
        </p>

        <h2 className="section__title" id={`${section.id}-title`}>
          {section.title}
        </h2>

        {subtitle && <p className="section__subtitle">{subtitle}</p>}

        <p className="section__lead">{section.lead}</p>
      </header>

      {section.hero && (
        <figure className="section__hero">
          <ZoomableImage image={section.hero} />
          <figcaption>{section.hero.caption}</figcaption>
        </figure>
      )}

      <Timeline events={section.events} label={section.navLabel} />

      <div className="section__body">
        <Blocks blocks={section.blocks} images={section.images} wikiFirst={section.wikiFirst} />
      </div>
    </section>
  )
})
