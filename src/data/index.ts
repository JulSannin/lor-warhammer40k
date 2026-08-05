import generated from './content.generated.json' with { type: 'json' }
import { meta } from './meta'
import { images } from './images'
import type { GeneratedContent, Section, SectionImage, TimelineEvent } from './types'

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

export const docTitle = content.docTitle
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
  return section.hero ? [section.hero, ...inline] : inline
}

export const allImages: SectionImage[] = sections.flatMap(inPageOrder)

/** Раздел по короткому id или по якорю из markdown. */
export function findSection(key: string): Section | undefined {
  const needle = decodeURIComponent(key).replace(/^#/, '')
  return sections.find((s) => s.id === needle || s.anchor === needle)
}

/** Сквозная лента: все датированные события всех разделов по возрастанию. */
export const globalTimeline: (TimelineEvent & { sectionId: string })[] = sections
  .flatMap((s) => s.events.map((e) => ({ ...e, sectionId: s.id })))
  .sort((a, b) => a.year - b.year)

export type { Section, TimelineEvent } from './types'
