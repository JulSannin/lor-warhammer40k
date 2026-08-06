import { memo } from 'react'
import type { Block, SectionImage } from '../data/types'
import { ZoomableImage } from './Lightbox'
import './PrimarchGrid.css'

/** Убирает `**жирный**` и `*курсив*` — в карточке разметка не нужна. */
const plain = (s: string) => s.replace(/\*\*/g, '').replace(/\*/g, '').trim()

/**
 * Галерея примархов под таблицей легионов.
 *
 * Строится из той же таблицы, что и текст, — номер, имя, легион и судьба
 * берутся из неё, а портрет подбирается по номеру. Это важно: если правка
 * лора изменит таблицу, галерея изменится вместе с ней, а не разойдётся.
 *
 * II и XI легионы стёрты из истории — для них портрета нет и быть не может.
 * Карточка у них остаётся, но пустая: это часть сюжета, а не пробел в данных.
 */
export const PrimarchGrid = memo(function PrimarchGrid({
  table,
  images,
}: {
  table: Extract<Block, { type: 'table' }>
  images: SectionImage[]
}) {
  const byNumber = new Map(images.filter((i) => i.primarch).map((i) => [i.primarch!, i]))

  return (
    <div className="pg">
      <h4 className="pg__title">Двадцать примархов</h4>
      <ol className="pg__list">
        {table.rows.map((row) => {
          const [num, name, legion, fate] = row.map(plain)
          const img = byNumber.get(num)
          const erased = !img
          const verdict = /предател/i.test(fate)
            ? 'traitor'
            : /лоялист/i.test(fate)
              ? 'loyal'
              : 'unknown'

          return (
            <li key={num} className={`pg__card pg__card--${verdict}${erased ? ' is-erased' : ''}`}>
              <div className="pg__frame">
                {img ? (
                  <ZoomableImage image={img} />
                ) : (
                  <div className="pg__void" aria-hidden="true">
                    <span>{num}</span>
                  </div>
                )}
              </div>
              <div className="pg__body">
                <span className="pg__num">{num}</span>
                <span className="pg__name">{name}</span>
                <span className="pg__legion">{legion}</span>
                {fate !== '—' && <span className="pg__fate">{fate}</span>}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
})
