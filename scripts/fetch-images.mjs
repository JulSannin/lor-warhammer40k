/**
 * Скачивает изображения из src/data/images.ts в public/img.
 *
 *   npm run images
 *
 * Уже скачанные файлы не трогает, поэтому запускать можно сколько угодно.
 * Ключ --force перекачивает всё заново.
 *
 * Зачем локальные копии, а не прямые ссылки на CDN: запрос за картинкой
 * уходил только когда кадр подходил к экрану, и на медленной сети ответ
 * приходил с задержкой — прокрутка выглядела рваной. Свои файлы отдаются
 * с того же домена, что и страница, и кешируются вместе с ней.
 *
 * Изображения — собственность Games Workshop Ltd., используются
 * некоммерчески в фанатском проекте.
 */

import { mkdirSync, existsSync, writeFileSync, statSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = resolve(root, 'public/img')
const force = process.argv.includes('--force')

// Fandom отдаёт WebP, если его попросить: он вдвое легче исходного JPEG
const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36',
  Accept: 'image/webp,image/avif,image/*,*/*;q=0.8',
}

const { images } = await import('../src/data/images.ts')

mkdirSync(outDir, { recursive: true })

const all = Object.values(images).flat()
let downloaded = 0
let skipped = 0
let bytes = 0
const failed = []

for (const img of all) {
  const name = img.src.replace(/^\.\/img\//, '')
  const dest = resolve(outDir, name)

  if (!force && existsSync(dest)) {
    skipped++
    bytes += statSync(dest).size
    continue
  }

  try {
    const res = await fetch(img.remote, { headers: HEADERS })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.length < 1024) throw new Error(`подозрительно мало байт: ${buf.length}`)
    writeFileSync(dest, buf)
    downloaded++
    bytes += buf.length
    console.log(
      `  ${String(Math.round(buf.length / 1024)).padStart(5)} KB  ${res.headers.get('content-type')}  ${name}`,
    )
  } catch (e) {
    failed.push(`${name}: ${e.message}`)
    console.error(`  ОШИБКА  ${name}: ${e.message}`)
  }
}

console.log('')
console.log(
  `Скачано: ${downloaded}, пропущено (уже есть): ${skipped}, всего ${Math.round(bytes / 1024 / 1024)} МБ`,
)

if (failed.length) {
  console.error(`\nНе удалось скачать ${failed.length}:\n  ${failed.join('\n  ')}`)
  process.exit(1)
}
