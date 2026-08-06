import generated from './content.generated.json' with { type: 'json' }
import { meta } from './meta'
import { images } from './images'
import type { GeneratedContent, Section, SectionImage } from './types'

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
    }
  })
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
  // Портреты примархов идут следом: в вёрстке они стоят в галерее под
  // таблицей легионов, и в попапе должны листаться в том же порядке
  const primarchs = section.images.filter((i) => i.role === 'primarch')
  return [...(section.hero ? [section.hero] : []), ...inline, ...primarchs]
}

export const allImages: SectionImage[] = sections.flatMap(inPageOrder)

/**
 * Высоты разделов, замеренные в браузере при ширине окна 1440px.
 *
 * Виртуализатору нужен размер раздела до того, как раздел построен: из
 * этих чисел складывается высота документа, а значит и размер ползунка
 * прокрутки. Расчётная формула по числу абзацев и картинок давала промах
 * до 36% на отдельных разделах — этого хватает, чтобы ползунок заметно
 * дёргался, когда виртуализатор заменяет оценку измерением. Замеры точнее
 * любой формулы, а состав лора меняется редко.
 *
 * Если правили WARHAMMER_40K_LORE.md и высоты уехали, перемерить так:
 * открыть сайт, прокрутить до конца и выполнить в консоли
 *   `Object.fromEntries([...document.querySelectorAll('.section')]
 *      .map(s => [s.id, Math.round(s.getBoundingClientRect().height)]))`
 * — но собирать значения придётся по ходу прокрутки, потому что в DOM
 * одновременно находятся только соседние разделы.
 */
const MEASURED: Record<string, number> = {
  'war-in-heaven': 6952,
  'eldar-fall': 4465,
  'pre-imperium': 3277,
  'emperor-crusade': 8643,
  'horus-heresy': 7502,
  'ten-thousand-years': 7332,
  chaos: 5964,
  xenos: 6871,
  indomitus: 6443,
  thesis: 2251,
  disputed: 4507,
}

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

export const sectionHeights: number[] = sections.map((s) => MEASURED[s.id] ?? guessHeight(s))
