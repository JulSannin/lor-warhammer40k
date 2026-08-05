import { Fragment, type ReactNode } from 'react'

/**
 * Разметка, унаследованная из markdown: `**жирный**`, `*курсив*`,
 * `[текст](#якорь)` и мягкий перенос строки.
 *
 * Вложенности в исходном лоре нет — проверено по всем 157 блокам, —
 * поэтому парсер плоский и без рекурсии. Если она появится, здесь
 * начнут просто протекать звёздочки, а не ломаться вёрстка.
 */
const INLINE = /\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)]+)\)/g

function parse(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = []
  let last = 0
  let i = 0

  for (const m of text.matchAll(INLINE)) {
    const at = m.index
    if (at > last) out.push(text.slice(last, at))

    const [, bold, italic, linkText, href] = m
    const key = `${keyPrefix}-${i++}`

    if (bold !== undefined) {
      out.push(<strong key={key}>{bold}</strong>)
    } else if (italic !== undefined) {
      out.push(<em key={key}>{italic}</em>)
    } else if (linkText !== undefined && href !== undefined) {
      out.push(
        <a key={key} href={href} className="rich-link">
          {linkText}
        </a>,
      )
    }
    last = at + m[0].length
  }

  if (last < text.length) out.push(text.slice(last))
  return out
}

export function RichText({ text }: { text: string }) {
  // Мягкие переносы значимы: в разделе про богов Хаоса девиз стоит
  // отдельной строкой, и склеивать его с описанием нельзя.
  const lines = text.split('\n')

  return (
    <>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {parse(line, String(i))}
        </Fragment>
      ))}
    </>
  )
}
