import { motion } from 'motion/react'
import type { TimelineEvent } from '../data/types'
import './Timeline.css'

/**
 * Локальная лента событий раздела.
 *
 * Порядок берётся из массива, а не из сортировки по `year`: у части
 * событий даты совпадают (три эпизода 999.М41), и только авторский
 * порядок отражает, что за чем следовало.
 */
export function Timeline({ events, label }: { events: TimelineEvent[]; label: string }) {
  if (events.length === 0) return null

  return (
    <section className="tl" aria-label={`Хронология: ${label}`}>
      <h3 className="tl__title">
        Хронология
        <span className="tl__count">{events.length}</span>
      </h3>

      <ol className="tl__list">
        {events.map((e, i) => (
          <motion.li
            key={`${e.year}-${e.title}`}
            className={`tl__item${e.major ? ' is-major' : ''}`}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-8% 0px' }}
            transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.3), ease: 'easeOut' }}
          >
            <time className="tl__date">{e.date}</time>
            <span className="tl__dot" aria-hidden="true" />
            <div className="tl__body">
              <h4 className="tl__event">{e.title}</h4>
              <p className="tl__summary">{e.summary}</p>
            </div>
          </motion.li>
        ))}
      </ol>
    </section>
  )
}
