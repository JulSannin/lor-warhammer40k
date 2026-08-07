import { memo } from 'react'
import type { Block, SectionImage } from '../data/types'
import { ZoomableImage } from './Lightbox'
import { PrimarchGrid } from './PrimarchGrid'
import { RichText } from './RichText'
import './Blocks.css'

function BlockView({ block, linkable }: { block: Block; linkable?: Set<string> }) {
  switch (block.type) {
    case 'heading':
      return (
        <h3 className="blk-heading" id={block.anchor}>
          <RichText text={block.text} linkable={linkable} />
        </h3>
      )

    case 'paragraph':
      return (
        <p className="blk-p">
          <RichText text={block.text} linkable={linkable} />
        </p>
      )

    case 'list':
      return block.ordered ? (
        <ol className="blk-list blk-list--ordered">
          {block.items.map((item, i) => (
            <li key={i}>
              <RichText text={item} linkable={linkable} />
            </li>
          ))}
        </ol>
      ) : (
        <ul className="blk-list">
          {block.items.map((item, i) => (
            <li key={i}>
              <RichText text={item} linkable={linkable} />
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
                      <RichText text={cell} linkable={linkable} />
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
          <RichText text={block.text} linkable={linkable} />
        </blockquote>
      )

    case 'disputed':
      return (
        <aside className="blk-disputed">
          <p className="blk-disputed__tag">спорно</p>
          <p>
            <RichText text={block.text} linkable={linkable} />
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

/**
 * Ряд картинок под одним подзаголовком.
 *
 * По умолчанию две в ряд, нечётная последняя занимает ряд целиком.
 * Но если вся группа — вертикальные портреты, показываемые целиком
 * (contain), они встают одним рядом: такой набор читается как триптих,
 * и разрывать его пополам незачем. Так собран пантеон эльдар.
 */
function FigureGroup({ images }: { images: SectionImage[] }) {
  if (images.length === 1) {
    return (
      <div className="blk-figures">
        <InlineImage image={images[0]} />
      </div>
    )
  }

  const allPortraits = images.every((i) => i.contain)

  return (
    <div
      className={`blk-figures blk-figures--${allPortraits ? 'row' : 'pair'}`}
      style={
        allPortraits ? ({ '--fig-cols': images.length } as React.CSSProperties) : undefined
      }
    >
      {images.map((i) => (
        <InlineImage key={i.src} image={i} />
      ))}
    </div>
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
  wikiFirst,
}: {
  blocks: Block[]
  images: SectionImage[]
  wikiFirst: Record<string, number>
}) {
  // Термин → блок первого упоминания разворачиваем в обратную сторону:
  // вёрстке нужно знать, что делать кликабельным в текущем блоке
  const linkableByBlock: (Set<string> | undefined)[] = blocks.map(() => undefined)
  for (const [term, index] of Object.entries(wikiFirst)) {
    if (index < linkableByBlock.length) (linkableByBlock[index] ??= new Set()).add(term)
  }

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
    out.push(<BlockView key={`b${i}`} block={block} linkable={linkableByBlock[i]} />)

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
      if (pics?.length) out.push(<FigureGroup key={`img${i}`} images={pics} />)
    }
  })

  if (trailing.length) {
    out.push(<FigureGroup key="img-tail" images={trailing} />)
  }

  return <div className="blocks">{out}</div>
})
