import generated from './content.generated.json' with { type: 'json' }
import wikiGenerated from './wiki.generated.json' with { type: 'json' }
import { meta } from './meta'
import { images } from './images'
import type { Block, GeneratedContent, Section, SectionImage, WikiEntry } from './types'

/**
 * Выжимки статей русской вики, собранные scripts/fetch-wiki.mjs.
 * Ключ — термин ровно в том виде, в каком он выделен жирным в лоре.
 */
export const wiki = wikiGenerated as Record<string, WikiEntry>

// JSON-импорт даёт `type: string` вместо литеральных типов блоков, поэтому
// прямое приведение TypeScript отвергает. Форму гарантирует генератор
// scripts/build-content.mjs — он же валидирует разметку при сборке.
const content = generated as unknown as GeneratedContent

/**
 * Сшивает разобранный markdown с редакторским слоем.
 *
 * Если для раздела нет записи в meta.ts — это ошибка сборки данных, а не
 * повод молча отрендерить пустоту: раздел появился в лоре, но никто не
 * решил, к какой он эпохе и что на его ленте времени.
 */
function assemble(): Section[] {
  return content.sections.map((parsed) => {
    const m = meta[parsed.id]
    if (!m) {
      throw new Error(
        `Нет метаданных для раздела «${parsed.id}» (${parsed.fullTitle}). ` +
          `Добавьте запись в src/data/meta.ts.`,
      )
    }
    const pics = images[parsed.id] ?? []
    return {
      ...parsed,
      ...m,
      images: pics,
      hero: pics.find((i) => i.role === 'hero') ?? null,
      wikiFirst: firstMentions(parsed.blocks),
    }
  })
}

/** Таблица примархов узнаётся по колонкам, а не по номеру в разделе. */
const isPrimarchTable = (b: Block) =>
  b.type === 'table' && b.head[0] === '№' && b.head[1] === 'Примарх'

/**
 * Находит для каждого термина блок, где раздел упоминает его впервые.
 *
 * Блоки перебираются в том же порядке, в каком их выводит вёрстка, —
 * иначе кликабельным окажется не первое упоминание, а произвольное.
 * Термины без статьи на вики сюда не попадают: они остаются обычным
 * жирным, и читатель ни разу не ткнётся в пустоту.
 */
function firstMentions(blocks: Block[]): Record<string, number> {
  const first: Record<string, number> = {}

  blocks.forEach((block, index) => {
    // Таблицу легионов пропускаем: ссылок в ней нет, справка по примархам
    // живёт на карточках галереи. Иначе таблица считалась бы первым
    // упоминанием, и имя не стало бы ссылкой уже нигде в разделе.
    if (isPrimarchTable(block)) return

    const texts: string[] = []
    if ('text' in block) texts.push(block.text)
    if ('items' in block) texts.push(...block.items)
    if ('head' in block) texts.push(...block.head)
    if ('rows' in block) for (const row of block.rows) texts.push(...row)

    for (const text of texts) {
      for (const match of text.matchAll(/\*\*(.+?)\*\*/g)) {
        const term = match[1]
        if (term in wiki && !(term in first)) first[term] = index
      }
    }
  })

  return first
}

export const sections: Section[] = assemble()

export const epigraph = content.epigraph

/**
 * Все изображения в том порядке, в каком они встречаются на странице:
 * сначала кадр в шапке раздела, затем картинки по тексту в порядке
 * подзаголовков, к которым они привязаны. Этот порядок задаёт переходы
 * «вперёд-назад» в попапе, поэтому он должен совпадать с версткой.
 */
function inPageOrder(section: Section): SectionImage[] {
  const inline = section.images
    .filter((i) => i.role === 'inline')
    .slice()
    .sort((a, b) => (a.afterHeading ?? Infinity) - (b.afterHeading ?? Infinity))
  const primarchs = section.images.filter((i) => i.role === 'primarch')

  /*
   * Галерея примархов встаёт перед таблицей легионов, а не в конце
   * раздела: значит, и в попапе портреты должны листаться на своём
   * месте — после картинок, привязанных к предыдущим подзаголовкам,
   * и перед теми, что идут ниже таблицы. Пока порядок был «портреты
   * последними», стрелка «вперёд» после портрета Малкадора уводила
   * не туда, куда смотрел читатель.
   */
  let headingsBeforeTable = Infinity
  if (primarchs.length > 0) {
    let headings = 0
    for (const block of section.blocks) {
      if (block.type === 'heading') headings += 1
      if (isPrimarchTable(block)) {
        headingsBeforeTable = headings
        break
      }
    }
  }
  const before = inline.filter((i) => (i.afterHeading ?? Infinity) < headingsBeforeTable)
  const after = inline.filter((i) => (i.afterHeading ?? Infinity) >= headingsBeforeTable)

  return [...(section.hero ? [section.hero] : []), ...before, ...primarchs, ...after]
}

export const allImages: SectionImage[] = sections.flatMap(inPageOrder)

/**
 * Высоты разделов, замеренные в браузере на трёх ширинах окна.
 *
 * Виртуализатору нужен размер раздела до того, как раздел построен: из
 * этих чисел складывается высота документа, а значит и размер ползунка
 * прокрутки. Расчётная формула по числу абзацев и картинок давала промах
 * до 36% на отдельных разделах — этого хватает, чтобы ползунок заметно
 * дёргался, когда виртуализатор заменяет оценку измерением. Замеры точнее
 * любой формулы, а состав лора меняется редко.
 *
 * Таблиц три, а не одна, потому что от ширины высота зависит сильно и
 * не монотонно. «Крестовый поход» на телефоне выше, чем на ноутбуке
 * (11289 против 9434): текст переливается, а галерея примархов идёт
 * в две колонки вместо пяти. А «Война в Небесах», наоборот, ниже
 * (5922 против 6966): широкие кадры 16:9 на узком экране мельчают.
 * С одной таблицей от 1440px высота документа на телефоне уезжала
 * на 10%, на планшете на 17% — и ползунок подрастал по ходу чтения.
 *
 * Перемерять нужно не только после правки лора, но и после любой правки
 * раскладки — числа колонок в галерее примархов, сетки картинок, отступов.
 * Делается так: открыть сайт на нужной ширине, прокрутить до конца и
 * обратно, собирая по ходу
 *   `Object.fromEntries([...document.querySelectorAll('.section')]
 *      .map(s => [s.id, Math.round(s.getBoundingClientRect().height)]))`
 * — собирать придётся по ходу прокрутки, потому что в DOM одновременно
 * находятся только соседние разделы.
 */
const MEASURED: Record<string, number>[] = [
  // 390px — телефон
  {
    'war-in-heaven': 5922,
    'eldar-fall': 7095,
    'pre-imperium': 2857,
    'emperor-crusade': 11327,
    'horus-heresy': 6788,
    'ten-thousand-years': 5467,
    chaos: 3405,
    xenos: 7369,
    indomitus: 6831,
    thesis: 1694,
    disputed: 3370,
  },
  // 834px — планшет
  {
    'war-in-heaven': 5376,
    'eldar-fall': 4668,
    'pre-imperium': 2492,
    'emperor-crusade': 8319,
    'horus-heresy': 6002,
    'ten-thousand-years': 5599,
    chaos: 4270,
    xenos: 5528,
    indomitus: 5769,
    thesis: 1768,
    disputed: 4008,
  },
  // 1440px — ноутбук и шире
  {
    'war-in-heaven': 6966,
    'eldar-fall': 5965,
    'pre-imperium': 3280,
    'emperor-crusade': 9460,
    'horus-heresy': 7786,
    'ten-thousand-years': 7345,
    chaos: 5969,
    xenos: 6857,
    indomitus: 7022,
    thesis: 2252,
    disputed: 5117,
  },
]

/** Запасная оценка для раздела, которого ещё нет в таблице замеров. */
function guessHeight(section: Section): number {
  let h = 320
  if (section.hero) h += 540
  if (section.events.length > 0) h += 30 + section.events.length * 58

  for (const b of section.blocks) {
    switch (b.type) {
      case 'heading':
        h += 50
        break
      case 'paragraph':
        h += 75 + Math.ceil(b.text.length / 95) * 34
        break
      case 'list':
        h += 20 + b.items.reduce((n, i) => n + 30 + Math.ceil(i.length / 95) * 34, 0)
        break
      case 'table':
        h += 90 + b.rows.length * 44
        break
      case 'quote':
        h += 160
        break
      case 'disputed':
        h += 90 + Math.ceil(b.text.length / 95) * 34
        break
    }
  }

  h += section.images.filter((i) => i.role === 'inline').length * 655
  return h + 150
}

/**
 * Какая из таблиц замеров подходит окну такой ширины.
 *
 * Границы — примерно посередине между ширинами замеров, так что окно
 * всегда берёт ближайший к себе набор чисел.
 */
export function heightBucket(width: number): number {
  if (width < 620) return 0
  if (width < 1140) return 1
  return 2
}

/** Оценки высот разделов по каждой из таблиц замеров. */
export const sectionHeights: number[][] = MEASURED.map((table) =>
  sections.map((s) => table[s.id] ?? guessHeight(s)),
)
