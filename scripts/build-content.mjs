/**
 * Превращает WARHAMMER_40K_LORE.md в типизированный JSON для сайта.
 *
 *   node scripts/build-content.mjs
 *
 * Запускается автоматически перед `npm run dev` и `npm run build`,
 * поэтому исходный markdown остаётся единственным источником правды:
 * правка текста в .md сразу отражается на сайте.
 *
 * Схема результата описана в src/data/types.ts — держите их синхронными.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = resolve(root, 'WARHAMMER_40K_LORE.md')
const OUT = resolve(root, 'src/data/content.generated.json')

/** Короткие латинские id — стабильные, в отличие от заголовков. */
const SLUGS = [
  'war-in-heaven',
  'eldar-fall',
  'pre-imperium',
  'emperor-crusade',
  'horus-heresy',
  'ten-thousand-years',
  'chaos',
  'xenos',
  'indomitus',
  'thesis',
  'disputed',
]

const warnings = []
const warn = (msg) => warnings.push(msg)

/* ------------------------------------------------------------------ *
 * Якоря в стиле GitHub — чтобы ссылки вида [текст](#часть-i-…),
 * уже расставленные внутри лора, продолжали работать на сайте.
 * ------------------------------------------------------------------ */
function githubSlug(heading) {
  return heading
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-')
}

/* ------------------------------------------------------------------ *
 * Разбор блоков
 * ------------------------------------------------------------------ */

const isTableRow = (l) => /^\|.*\|$/.test(l.trim())
const isTableDivider = (l) => /^\|[\s:|-]+\|$/.test(l.trim()) && l.includes('-')

const splitRow = (l) =>
  l
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim())

/**
 * @param {string[]} lines строки одного раздела (без заголовка `## `)
 * @returns {object[]} блоки
 */
function parseBlocks(lines, ctx) {
  const blocks = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    // Пустые строки и горизонтальные линии-разделители
    if (trimmed === '' || /^-{3,}$/.test(trimmed)) {
      i++
      continue
    }

    // Подзаголовок ### — либо дата раздела в скобках, либо обычный h3
    if (trimmed.startsWith('### ')) {
      const text = trimmed.slice(4).trim()
      const isDate = /^\(.*\)$/.test(text)
      if (isDate && blocks.length === 0) {
        ctx.subtitle = text
      } else {
        blocks.push({ type: 'heading', text, anchor: githubSlug(text) })
      }
      i++
      continue
    }

    // Таблица
    if (isTableRow(line) && isTableDivider(lines[i + 1] ?? '')) {
      const head = splitRow(line)
      i += 2
      const rows = []
      while (i < lines.length && isTableRow(lines[i])) {
        const cells = splitRow(lines[i])
        if (cells.length !== head.length) {
          warn(
            `таблица: строка с ${cells.length} ячейками при ${head.length} колонках — «${lines[i].slice(0, 50)}…»`,
          )
        }
        rows.push(cells)
        i++
      }
      blocks.push({ type: 'table', head, rows })
      continue
    }

    // Цитата
    if (trimmed.startsWith('> ')) {
      const parts = []
      while (i < lines.length && lines[i].trim().startsWith('> ')) {
        parts.push(lines[i].trim().slice(2).trim())
        i++
      }
      blocks.push({ type: 'quote', text: parts.join('\n') })
      continue
    }

    // Список — маркированный или нумерованный
    const bullet = /^[-*]\s+/
    const numbered = /^\d+\.\s+/
    if (bullet.test(trimmed) || numbered.test(trimmed)) {
      const ordered = numbered.test(trimmed)
      const marker = ordered ? numbered : bullet
      const items = []
      while (i < lines.length) {
        const cur = lines[i]
        const curTrimmed = cur.trim()
        if (marker.test(curTrimmed)) {
          items.push(curTrimmed.replace(marker, ''))
          i++
        } else if (/^\s{2,}\S/.test(cur) && items.length > 0) {
          // Продолжение предыдущего пункта на следующей строке
          items[items.length - 1] += ' ' + curTrimmed
          i++
        } else {
          break
        }
      }
      blocks.push({ type: 'list', ordered, items })
      continue
    }

    // Абзац: подряд идущие непустые строки. Мягкие переносы сохраняем —
    // в разделе про богов Хаоса они несут смысл (девиз отдельной строкой).
    const parts = []
    while (i < lines.length) {
      const cur = lines[i]
      const curTrimmed = cur.trim()
      if (
        curTrimmed === '' ||
        curTrimmed.startsWith('#') ||
        curTrimmed.startsWith('> ') ||
        /^-{3,}$/.test(curTrimmed) ||
        bullet.test(curTrimmed) ||
        numbered.test(curTrimmed) ||
        isTableRow(cur)
      ) {
        break
      }
      parts.push(curTrimmed)
      i++
    }
    const text = parts.join('\n')
    // Абзац, начинающийся с **[спорно]**, — это врезка, а не обычный текст
    if (/^\*\*\[спорно\]\*\*/.test(text)) {
      blocks.push({
        type: 'disputed',
        text: text.replace(/^\*\*\[спорно\]\*\*\s*/, ''),
      })
    } else {
      blocks.push({ type: 'paragraph', text })
    }
  }

  return blocks
}

/* ------------------------------------------------------------------ *
 * Проверка inline-разметки: ловим синтаксис, который рендерер не знает
 * ------------------------------------------------------------------ */
function auditInline(text, where) {
  const stripped = text
    .replace(/\*\*[^*]+\*\*/g, '')
    .replace(/\*[^*]+\*/g, '')
    .replace(/\[[^\]]+\]\([^)]+\)/g, '')
  const leftovers = stripped.match(/[*_`~]|\[|\]\(/g)
  if (leftovers) {
    warn(
      `${where}: непарная inline-разметка (${[...new Set(leftovers)].join(' ')}) — «${text.slice(0, 60)}…»`,
    )
  }
}

function walkText(blocks, where) {
  for (const b of blocks) {
    if (
      b.type === 'paragraph' ||
      b.type === 'quote' ||
      b.type === 'disputed' ||
      b.type === 'heading'
    ) {
      auditInline(b.text, where)
    } else if (b.type === 'list') {
      b.items.forEach((it) => auditInline(it, where))
    } else if (b.type === 'table') {
      b.rows.flat().forEach((c) => auditInline(c, where))
    }
  }
}

/* ------------------------------------------------------------------ *
 * Основной проход
 * ------------------------------------------------------------------ */

const raw = readFileSync(SRC, 'utf8').replace(/\r\n/g, '\n')
const allLines = raw.split('\n')

// Заголовок документа и эпиграф
const docTitle = (allLines.find((l) => l.startsWith('# ')) ?? '# ').slice(2).trim()
const epigraphLine = allLines.find((l) => l.startsWith('> '))
const epigraph = epigraphLine ? epigraphLine.slice(2).trim() : null

// Оглавление: даёт короткие человеческие названия для навигации
const tocLabels = []
for (const line of allLines) {
  const m = line.match(/^\d+\.\s+\[([^\]]+)\]\(#([^)]+)\)\s*$/)
  if (m) tocLabels.push({ label: m[1], anchor: m[2] })
}

// Разбиение на разделы по `## `
const headingIdx = []
allLines.forEach((l, idx) => {
  if (l.startsWith('## ')) headingIdx.push(idx)
})

const sections = []
for (let h = 0; h < headingIdx.length; h++) {
  const start = headingIdx[h]
  const end = h + 1 < headingIdx.length ? headingIdx[h + 1] : allLines.length
  const fullTitle = allLines[start].slice(3).trim()

  if (fullTitle === 'Содержание') continue

  const ctx = { subtitle: null }
  const blocks = parseBlocks(allLines.slice(start + 1, end), ctx)

  const anchor = githubSlug(fullTitle)
  const idx = sections.length
  const toc = tocLabels[idx]

  if (!toc) {
    warn(`раздел «${fullTitle}» отсутствует в оглавлении`)
  } else if (toc.anchor !== anchor) {
    warn(`якорь не совпал с оглавлением: заголовок → «${anchor}», оглавление → «${toc.anchor}»`)
  }

  // «ЧАСТЬ V. ЕРЕСЬ ХОРУСА» → part: 'ЧАСТЬ V', title: 'ЕРЕСЬ ХОРУСА'
  const partMatch = fullTitle.match(/^(ЧАСТЬ\s+[IVX]+)\.\s*(.+)$/)

  sections.push({
    id: SLUGS[idx] ?? `section-${idx + 1}`,
    anchor,
    index: idx + 1,
    part: partMatch ? partMatch[1] : null,
    title: partMatch ? partMatch[2] : fullTitle,
    fullTitle,
    navLabel: toc ? toc.label : fullTitle,
    subtitle: ctx.subtitle,
    blocks,
  })

  walkText(blocks, `раздел ${idx + 1} «${fullTitle}»`)
}

if (sections.length !== SLUGS.length) {
  warn(`разделов найдено ${sections.length}, ожидалось ${SLUGS.length} — проверьте SLUGS`)
}

const payload = {
  $generatedBy:
    'scripts/build-content.mjs — не редактируйте вручную, правьте WARHAMMER_40K_LORE.md',
  docTitle,
  epigraph,
  sections,
}

writeFileSync(OUT, JSON.stringify(payload, null, 2) + '\n', 'utf8')

/* ------------------------------------------------------------------ *
 * Отчёт
 * ------------------------------------------------------------------ */
const blockCount = sections.reduce((n, s) => n + s.blocks.length, 0)
const byType = {}
for (const s of sections) {
  for (const b of s.blocks) byType[b.type] = (byType[b.type] ?? 0) + 1
}

console.log(`Разделов: ${sections.length}, блоков: ${blockCount}`)
console.log(
  Object.entries(byType)
    .sort((a, b) => b[1] - a[1])
    .map(([t, n]) => `  ${t}: ${n}`)
    .join('\n'),
)

if (warnings.length) {
  console.log(`\nПредупреждений: ${warnings.length}`)
  warnings.forEach((w) => console.log(`  ! ${w}`))
} else {
  console.log('\nПредупреждений нет.')
}
