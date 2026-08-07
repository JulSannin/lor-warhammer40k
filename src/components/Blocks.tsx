import { memo } from 'react'
import type { Block, SectionImage } from '../data/types'
import { ZoomableImage } from './Lightbox'
import { PrimarchGrid } from './PrimarchGrid'
import { RichText } from './RichText'
import './Blocks.css'

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case 'heading':
      return (
        <h3 className="blk-heading" id={block.anchor}>
          <RichText text={block.text} />
        </h3>
      )

    case 'paragraph':
      return (
        <p className="blk-p">
          <RichText text={block.text} />
        </p>
      )

    case 'list':
      return block.ordered ? (
        <ol className="blk-list blk-list--ordered">
          {block.items.map((item, i) => (
            <li key={i}>
              <RichText text={item} />
            </li>
          ))}
        </ol>
      ) : (
        <ul className="blk-list">
          {block.items.map((item, i) => (
            <li key={i}>
              <RichText text={item} />
            </li>
          ))}
        </ul>
      )

    case 'table':
      return (
        // Таблица примархов — двадцать строк и четыре колонки; на узком
        // экране она прокручивается внутри себя, а не растягивает страницу.
        <div className="blk-table-wrap" tabIndex={0} role="region" aria-label="Таблица">
          <table className="blk-table">
            <thead>
              <tr>
                {block.head.map((h, i) => (
                  <th key={i} scope="col">
                    <RichText text={h} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j}>
                      <RichText text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )

    case 'quote':
      return (
        <blockquote className="blk-quote">
          <RichText text={block.text} />
        </blockquote>
      )

    case 'disputed':
      return (
        <aside className="blk-disputed">
          <p className="blk-disputed__tag">спорно</p>
          <p>
            <RichText text={block.text} />
          </p>
        </aside>
      )
  }
}

function InlineImage({ image }: { image: SectionImage }) {
  return (
    // Появление на CSS, а не на motion: наблюдателей выходило до шести
    // на раздел, и вся эта работа приходилась на кадр его монтирования
    <figure
      className={`blk-figure${image.contain ? ' blk-figure--contain' : ''}${image.plate ? ' blk-figure--plate' : ''}`}
    >
      <ZoomableImage image={image} />
      <figcaption>{image.caption}</figcaption>
    </figure>
  )
}

/** Таблица примархов узнаётся по колонкам, а не по номеру в разделе. */
const isPrimarchTable = (b: Block) =>
  b.type === 'table' && b.head[0] === '№' && b.head[1] === 'Примарх'

/**
 * Раскладывает блоки раздела и вплетает картинки после подзаголовков,
 * к которым они привязаны в images.ts. Несколько картинок на один
 * подзаголовок встают парами в сетку.
 */
export const Blocks = memo(function Blocks({
  blocks,
  images,
}: {
  blocks: Block[]
  images: SectionImage[]
}) {
  const byHeading = new Map<number, SectionImage[]>()
  const trailing: SectionImage[] = []

  for (const img of images) {
    if (img.role !== 'inline') continue
    if (img.afterHeading === undefined) trailing.push(img)
    else {
      const list = byHeading.get(img.afterHeading) ?? []
      list.push(img)
      byHeading.set(img.afterHeading, list)
    }
  }

  let headingIndex = -1
  const out: React.ReactNode[] = []

  blocks.forEach((block, i) => {
    out.push(<BlockView key={`b${i}`} block={block} />)

    // Сразу под таблицей легионов — галерея портретов из неё же
    if (isPrimarchTable(block)) {
      out.push(
        <PrimarchGrid
          key={`pg${i}`}
          table={block as Extract<Block, { type: 'table' }>}
          images={images}
        />,
      )
    }

    if (block.type === 'heading') {
      headingIndex += 1
      const pics = byHeading.get(headingIndex)
      if (pics?.length) {
        out.push(
          <div
            key={`img${i}`}
            className={`blk-figures${pics.length > 1 ? ' blk-figures--pair' : ''}`}
          >
            {pics.map((p) => (
              <InlineImage key={p.src} image={p} />
            ))}
          </div>,
        )
      }
    }
  })

  if (trailing.length) {
    out.push(
      <div
        key="img-tail"
        className={`blk-figures${trailing.length > 1 ? ' blk-figures--pair' : ''}`}
      >
        {trailing.map((p) => (
          <InlineImage key={p.src} image={p} />
        ))}
      </div>,
    )
  }

  return <div className="blocks">{out}</div>
})
