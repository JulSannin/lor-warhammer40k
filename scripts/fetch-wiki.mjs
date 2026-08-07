// @ts-check
/**
 * Связывает выделенные жирным термины лора со статьями русской вики.
 *
 * Зачем скрипт, а не запрос из браузера: попап должен открываться сразу
 * и не тянуть ничего со стороны — ровно по той же причине, по которой
 * картинки и шрифты лежат в проекте. Здесь то же самое для текста:
 * абзац и миниатюра снимаются один раз при сборке.
 *
 * Встроить страницу вики во фрейм нельзя — Fandom отдаёт заголовок
 * X-Frame-Options: sameorigin, и браузер отказывается её показывать.
 * Поэтому берём через API первую секцию статьи и показываем своей
 * карточкой.
 *
 *   npm run wiki            докачать недостающее
 *   npm run wiki -- --force перечитать все статьи заново
 *
 * Результат — src/data/wiki.generated.json. Руками не редактируется:
 * поправки вносятся в таблицу ALIASES ниже.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'

const API = 'https://warhammer40k.fandom.com/ru/api.php'
const SRC = new URL('../src/data/content.generated.json', import.meta.url)
const OUT = new URL('../src/data/wiki.generated.json', import.meta.url)
const THUMBS = new URL('../public/img/wiki/', import.meta.url)
const UA = { 'User-Agent': 'lor-warhammer40k/1.0 (build-time wiki link resolver)' }

/**
 * Названия, которые автоматика не находит.
 *
 * Три причины промаха: термин стоит в косвенном падеже («Лемана Руса»),
 * вики зовёт его иначе («Асурьян» против «Азуриан»), или в тексте лора
 * он назван вместе с пояснением («Безмолвный Царь (Szarekh)»).
 *
 * `null` — статьи нет и не будет, не искать. Так помечены термины,
 * которых на вики действительно не существует: проверено поиском.
 */
const ALIASES = {
  // Косвенные падежи
  орков: 'Орки',
  Ишу: 'Иша',
  Тзинчем: 'Тзинч',
  Коморре: 'Комморра',
  Механикумом: 'Адептус Механикус',
  'Лемана Руса': 'Леман Русс',
  'Арика Тараниса': 'Арик Таранис',
  'Малкадора Сигиллита': 'Малкадор Сигиллит',
  'Громовых Воинов': 'Громовые Воины',
  // Отдельной статьи о Великой Игре нет — она описана в общей о богах
  'Великую Игру': 'Боги Хаоса',
  'Имперской Истины': 'Имперская Истина',
  // Отдельной статьи об Имперской Паутине нет, она часть общей
  'Имперскую Паутину': 'Паутина',
  'Культы Генокрадов': 'Культ генокрадов',
  'династии Саутех': 'Саутех',
  'династии Нихилах': 'Нигилах',

  // Вики зовёт иначе
  'Абаддон Разоритель': 'Абаддон',
  Кустодий: 'Адептус Кустодес',
  Морк: 'Горк и Морк',
  Иврейн: 'Иврайна',
  'Белизарий Каул': 'Велизарий Коул',
  'Примарис-космодесантников': 'Космодесант Примарис',
  'Кадианские Врата': 'Кадия',
  Эфириалы: 'Кастовая система тау',
  'Крестовый Поход Индомитус': 'Неодолимый крестовый поход',
  Слааны: 'Сланны',
  'Инари (Ynnari)': 'Иннари',
  'Малал / Малис': 'Злоба',
  'Магистр Администратума': 'Администратум',
  'Пария-Нексус': 'Звено-Пария',
  'Вашторр Архифан': 'Вашторр',
  'Олланий Пий': 'Вечные',
  'Олланий Перссон, «вечный»': 'Вечные',
  Скалу: 'Скала (Калибан)',
  Скале: 'Скала (Калибан)',
  'Чёрный Камень-Крепость «Воля Вечности»': 'Чернокаменная крепость',
  'уничтожил сеть Пилонов': 'Кадианские пилоны',
  'II и XI легионы': 'Расколотые легионы',
  Асурьян: 'Азуриан',
  Кхаин: 'Кхейн',
  Кегорах: 'Цегорах',
  Слаанов: 'Сланны',
  Порабощающие: 'Поработители',
  'Люди из Железа': 'Железные люди',
  'Собор на Никее': 'Никейский Совет',
  'Изстван III': 'Предательство на Истваане III',
  'Имперское Кредо': 'Имперский Культ',
  'ВААААГХ!': 'Waaagh!',
  Путь: 'Пути эльдар',
  Бегемот: 'Флот-улей Бегемот',
  Кракен: 'Флот-улей Кракен',
  'Астартес — Космодесантники': 'Космодесант',
  '20 Примархов': 'Примархи',
  'Эльдар Кораблей-Миров': 'Эльдар',

  // Термин назван вместе с пояснением или в составе оборота
  'Безмолвный Царь (Szarekh)': 'Сарех',
  'Безмолвный Царь Шарек': 'Сарех',
  'Демон-примарх Ангрон': 'Ангрон',
  'восстанием Людей из Железа': 'Железные люди',
  'разрушил Имперскую Паутину': 'Паутина',
  Огонь: 'Кастовая система тау',
  Земля: 'Кастовая система тау',
  Воздух: 'Кастовая система тау',
  Вода: 'Кастовая система тау',
  'луне Давина': 'Давин',
  'Разумом Улья': 'Разум Улья',
  'Тень в Варпе': 'Тираниды',
  спорами: 'Тираниды',
  'стазис-гробницы': 'Некроны',
  некродермиса: "К'тан",
  'Культы Наслаждения': 'Тёмные эльдар',
  '13 Чёрных Крестовых Походов': 'Чёрный крестовый поход',

  // Статьи не существует — проверено, не искать
  Крорки: null,
  Биотрансференция: null,
  Кхур: null,
  Лилеат: null,
  'Имотех Штормовержец': null,
  'Битва при Горе Арарат': null,
  'Правление Крови': null,
  Shards: null,
  'Империум Нихилус': null,
  'Ковчеги Знамения': null,
  'Разбитые Легионы': null,
  'Rogue Trader': null,
  Монархию: null,
  Вирмвуд: null,
  'Диссонансный Двигатель': null,
  "Высшее Благо (Tau'va)": null,
}

/**
 * Статьи, у которых заглавная картинка нарисована на белом.
 *
 * Таких на вики примерно каждая шестая: фотографии миниатюр на белом
 * столе, схемы, гербы. На тёмной карточке такая картинка — вырвиглазное
 * пятно, а обрезка по кадру рубит её пополам. Помеченные здесь подаются
 * иначе: целиком и на светлой подложке, как вклейка в книге.
 *
 * Список снят замером: доля почти белых пикселей 12% и выше. Проверить
 * заново — открыть сайт и выполнить в консоли:
 *   const c=document.createElement('canvas'),x=c.getContext('2d');c.width=c.height=40
 *   for (const f of ФАЙЛЫ) { const i=new Image(); i.src='./img/wiki/'+f; await i.decode()
 *     x.drawImage(i,0,0,40,40); const d=x.getImageData(0,0,40,40).data; let n=0
 *     for (let k=0;k<d.length;k+=4) if ((.2126*d[k]+.7152*d[k+1]+.0722*d[k+2])/255>.8) n++
 *     if (n/1600>=.12) console.log(f, (n/1600).toFixed(2)) }
 */
const LIGHT_THUMBS = new Set([
  'Адептус Кустодес',
  'Администратум',
  'Альтансар',
  'Арлекины',
  'Велизарий Коул',
  'Гвозди Мясника',
  'Гог Вандир',
  'Громовые Воины',
  'Древние',
  'Злоба',
  'Империум Человечества',
  'Имперский Культ',
  'Иннеад',
  "К'тан",
  'Кадианские пилоны',
  'Кастовая система тау',
  'Ордо Ксенос',
  'Ордо Маллеус',
  'Паутина',
  'Сланны',
  'Тёмные эльдар',
  'Ужасы Тзинча',
  'Фаланга',
  'Чернокаменная крепость',
  'Экклезиархия',
  'Эреб',
  'Камни душ',
])

const args = process.argv.slice(2)
const force = args.includes('--force')

/** Выделения жирным в порядке появления, без повторов. */
function collectTerms() {
  const content = JSON.parse(readFileSync(SRC, 'utf8'))
  const terms = new Set()
  const scan = (text) => {
    if (typeof text !== 'string') return
    for (const m of text.matchAll(/\*\*(.+?)\*\*/g)) terms.add(m[1])
  }
  for (const section of content.sections) {
    for (const block of section.blocks) {
      scan(block.text)
      block.items?.forEach(scan)
      block.head?.forEach(scan)
      block.rows?.forEach((row) => row.forEach(scan))
    }
  }
  // Врезка «[спорно]» разбирается в отдельный тип блока, её метка сюда
  // попасть не должна — но если разметку поправят, пусть не попадёт и впредь
  terms.delete('[спорно]')
  return [...terms]
}

async function api(params) {
  const url = `${API}?${new URLSearchParams({ format: 'json', ...params })}`
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { headers: UA })
      if (res.ok) return await res.json()
      if (res.status === 429 || res.status >= 500) {
        await new Promise((r) => setTimeout(r, 400 * attempt))
        continue
      }
      throw new Error(`HTTP ${res.status}`)
    } catch (e) {
      if (attempt === 3) throw e
      await new Promise((r) => setTimeout(r, 400 * attempt))
    }
  }
}

const chunk = (arr, n) => {
  const out = []
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n))
  return out
}

/**
 * Термин → название статьи.
 *
 * Порядок: ручная таблица, затем точное совпадение (вики сама чинит
 * регистр и разворачивает перенаправления), затем поиск. Результат
 * поиска берём только если название похоже на термин: без этой проверки
 * вики на «Крорки» бодро отвечает «Древние», и ссылка ведёт не туда.
 */
async function resolveTitles(terms) {
  const found = new Map()
  const skip = new Set()
  const rest = []

  for (const term of terms) {
    if (term in ALIASES) {
      const alias = ALIASES[term]
      if (alias === null) skip.add(term)
      else found.set(term, alias)
    } else rest.push(term)
  }

  /*
   * Точное совпадение — пачками, вики принимает до 50 названий за раз.
   *
   * Запоминаем не то, что спросили, а то, как статья называется на самом
   * деле: вики поднимает первую букву и разворачивает перенаправления.
   * Без этого в заголовке карточки стояло «некронтир» со строчной —
   * то есть слово из лора, а не название статьи.
   */
  const canonical = new Map()
  const pending = [...found.values(), ...rest]
  for (const part of chunk([...new Set(pending)], 40)) {
    const data = await api({ action: 'query', redirects: '1', titles: part.join('|') })
    const back = new Map()
    for (const n of data.query.normalized ?? []) back.set(n.to, n.from)
    for (const r of data.query.redirects ?? []) back.set(r.to, back.get(r.from) ?? r.from)
    for (const page of Object.values(data.query.pages)) {
      if (page.missing !== undefined) continue
      canonical.set(back.get(page.title) ?? page.title, page.title)
    }
  }

  const good = new Map()
  for (const [term, alias] of found) {
    const real = canonical.get(alias)
    if (real) good.set(term, real)
  }
  const stillMissing = []
  for (const term of rest) {
    const real = canonical.get(term)
    if (real) good.set(term, real)
    else stillMissing.push(term)
  }

  // Поиск для остатка
  const norm = (s) =>
    s
      .toLowerCase()
      .replace(/ё/g, 'е')
      .replace(/[^\p{L}\p{N}]/gu, '')
  for (const term of stillMissing) {
    const data = await api({
      action: 'query',
      list: 'search',
      srlimit: '1',
      srsearch: term,
    })
    const hit = data.query?.search?.[0]
    if (!hit) continue
    const a = norm(hit.title)
    const b = norm(term)
    const close =
      a === b ||
      a.startsWith(b.slice(0, Math.max(5, b.length - 3))) ||
      b.startsWith(a.slice(0, Math.max(5, a.length - 3)))
    if (close) good.set(term, hit.title)
  }

  return { titles: good, skipped: skip }
}

const ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  laquo: '«',
  raquo: '»',
  mdash: '—',
  ndash: '–',
  hellip: '…',
  shy: '',
}

function decode(s) {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&(\w+);/g, (m, name) => ENTITIES[name] ?? m)
}

/** Убирает парный тег вместе с содержимым, разбираясь во вложенности. */
function dropTag(html, tag) {
  const open = new RegExp(`<${tag}\\b[^>]*>`, 'i')
  const both = new RegExp(`<${tag}\\b[^>]*>|</${tag}>`, 'gi')
  let out = html
  let guard = 0
  while (open.test(out) && guard++ < 50) {
    const start = out.search(open)
    both.lastIndex = start
    let depth = 0
    let end = -1
    let m
    while ((m = both.exec(out))) {
      depth += m[0][1] === '/' ? -1 : 1
      if (depth === 0) {
        end = m.index + m[0].length
        break
      }
    }
    if (end === -1) return out.slice(0, start)
    out = out.slice(0, start) + out.slice(end)
  }
  return out
}

/**
 * Первый содержательный абзац статьи.
 *
 * Из HTML первой секции выкидываем всё, что не текст: инфобокс сбоку,
 * таблицы, врезки с цитатами, сноски. Без этого абзац начинался словами
 * «Прозвище Непобеждённый Родной мир Нуцерия Легион Пожиратели Миров» —
 * это инфобокс, вытянутый в строку.
 *
 * Из оставшихся абзацев берём тот, где встречается название статьи:
 * у некоторых статей первым идёт абзац о происхождении имени, а не
 * определение. Если такого нет — первый достаточно длинный.
 */
function leadParagraph(html, title) {
  let s = html
  for (const tag of ['script', 'style', 'table', 'aside', 'figure', 'dl', 'blockquote'])
    s = dropTag(s, tag)
  s = s.replace(/<sup\b[^>]*>[\s\S]*?<\/sup>/gi, '')

  const paragraphs = []
  for (const m of s.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)) {
    const text = decode(m[1].replace(/<[^>]+>/g, ' '))
      .replace(/\s+/g, ' ')
      // Теги заменены пробелом, иначе слова слипались бы; но перед знаком
      // препинания и после открывающей скобки этот пробел лишний —
      // выходило «примархов , созданных» и «(англ. Angron )»
      .replace(/\s+([,.;:!?)»…])/g, '$1')
      .replace(/([(«])\s+/g, '$1')
      .trim()
    if (text.length >= 60) paragraphs.push(text)
  }
  if (paragraphs.length === 0) return null

  const key = title.split(/[\s(]/)[0].toLowerCase()
  const named = paragraphs.find((p) => p.toLowerCase().includes(key))
  return named ?? paragraphs[0]
}

/** Обрезает по границе предложения, чтобы карточка не обрывалась на полуслове. */
function trim(text, limit = 420) {
  if (text.length <= limit) return text
  const cut = text.slice(0, limit)
  const stop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '))
  return stop > limit * 0.5 ? cut.slice(0, stop + 1) : cut.replace(/\s+\S*$/, '') + '…'
}

const CYR = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'e',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'h',
  ц: 'c',
  ч: 'ch',
  ш: 'sh',
  щ: 'sch',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
}

/** Имя файла миниатюры: латиница, чтобы путь не зависел от кодировки. */
function slugify(title) {
  const s = [...title.toLowerCase()]
    .map((c) => CYR[c] ?? c)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  if (!s) throw new Error(`Пустое имя файла для статьи «${title}»`)
  return s
}

/**
 * Скачивает миниатюру статьи в проект.
 *
 * Ссылку на CDN Fandom хранить нельзя: страница специально не делает
 * ни одного внешнего запроса — ради скорости и чтобы работать там, где
 * Fandom недоступен. Возвращает путь внутри сайта либо null.
 */
async function fetchThumb(url, title) {
  const name = `${slugify(title)}.webp`
  const file = new URL(name, THUMBS)
  if (existsSync(file) && !force) return name
  const res = await fetch(url, {
    headers: {
      ...UA,
      Accept: 'image/webp,image/*',
      Referer: 'https://warhammer40k.fandom.com/',
    },
  })
  if (!res.ok) return null
  writeFileSync(file, Buffer.from(await res.arrayBuffer()))
  return name
}

const thumbCache = new Map()

async function main() {
  const terms = collectTerms()
  console.log(`Выделений в лоре: ${terms.length}`)
  mkdirSync(THUMBS, { recursive: true })

  const previous = !force && existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : {}
  const { titles, skipped } = await resolveTitles(terms)
  console.log(`Связано со статьями: ${titles.size}`)

  const out = {}
  let fetched = 0
  let reused = 0
  const empty = []

  for (const [term, title] of titles) {
    // Из кеша берём только то, что не разошлось с таблицами: иначе правка
    // ALIASES или LIGHT_THUMBS молча не доезжала бы до данных
    const cached = previous[term]
    if (
      cached?.title === title &&
      cached.extract &&
      !!cached.lightThumb === (LIGHT_THUMBS.has(title) && !!cached.thumb)
    ) {
      out[term] = cached
      reused += 1
      continue
    }
    const [parsed, info] = await Promise.all([
      // redirects — обязательно: «Император» и «Магнус Красный» на вики
      // перенаправления, и без этого вместо статьи приходит страница
      // с единственной строкой «Перенаправление на:»
      api({ action: 'parse', prop: 'text', section: '0', redirects: '1', page: title }),
      api({
        action: 'query',
        prop: 'pageimages',
        piprop: 'thumbnail',
        pithumbsize: '260',
        titles: title,
      }),
    ])
    let extract = parsed?.parse?.text?.['*']
      ? leadParagraph(parsed.parse.text['*'], title)
      : null

    // У части статей нулевая секция — одна картинка или инфобокс без
    // текста («Культ генокрадов», «Waaagh!», «Администратум»). Тогда
    // читаем страницу целиком и берём первый абзац оттуда.
    if (!extract) {
      const whole = await api({ action: 'parse', prop: 'text', redirects: '1', page: title })
      if (whole?.parse?.text?.['*']) extract = leadParagraph(whole.parse.text['*'], title)
    }

    if (!extract) {
      empty.push(`${term} → ${title}`)
      continue
    }
    const page = Object.values(info.query.pages)[0]
    // Несколько терминов ведут в одну статью (четыре касты тау — в одну);
    // миниатюру такой статьи качаем один раз
    let thumb = null
    if (page?.thumbnail) {
      thumb = thumbCache.get(title)
      if (thumb === undefined) {
        thumb = await fetchThumb(page.thumbnail.source, title)
        thumbCache.set(title, thumb)
      }
    }
    out[term] = {
      title,
      extract: trim(extract),
      ...(thumb
        ? {
            thumb,
            thumbWidth: page.thumbnail.width,
            thumbHeight: page.thumbnail.height,
            ...(LIGHT_THUMBS.has(title) ? { lightThumb: true } : {}),
          }
        : {}),
    }
    fetched += 1
    // Возврат каретки только в терминале: в файле или конвейере он не
    // затирает строку, и лог превращается в одну простыню из ста строк
    if (process.stdout.isTTY)
      process.stdout.write(`\r  скачано ${fetched}, из кеша ${reused}   `)
  }
  if (process.stdout.isTTY) process.stdout.write('\r' + ' '.repeat(40) + '\r')

  writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n')

  const linked = Object.keys(out)
  const unlinked = terms.filter((t) => !out[t])
  console.log(`\nВ карточках: ${linked.length} (скачано ${fetched}, из кеша ${reused})`)
  console.log(`С миниатюрой: ${linked.filter((t) => out[t].thumb).length}`)

  if (empty.length) {
    console.log(`\nСтатья есть, но абзац не извлёкся (${empty.length}):`)
    empty.forEach((e) => console.log('  ' + e))
  }

  console.log(`\nОстались обычным жирным (${unlinked.length}):`)
  for (const t of unlinked) {
    const why = skipped.has(t) ? 'статьи нет' : 'не найдено'
    console.log(`  ${t}  — ${why}`)
  }
}

await main()
