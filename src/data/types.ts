/**
 * Схема данных сайта.
 *
 * Данные собираются из двух источников:
 *  1. content.generated.json — текст, разобранный из WARHAMMER_40K_LORE.md
 *     скриптом scripts/build-content.mjs. Машинный, не редактируется руками.
 *  2. meta.ts + images.ts — редакторский слой: эпохи, события таймлайна,
 *     акцентные цвета, картинки. Пишется руками.
 *
 * src/data/index.ts сшивает их в единый массив `sections`.
 */

/**
 * Текст с упрощённой inline-разметкой, унаследованной из markdown:
 * `**жирный**`, `*курсив*`, `[текст](#якорь)`.
 * Символ `\n` означает мягкий перенос строки внутри абзаца.
 */
export type RichText = string

export type Block =
  | { type: 'heading'; text: RichText; anchor: string }
  | { type: 'paragraph'; text: RichText }
  | { type: 'list'; ordered: boolean; items: RichText[] }
  | { type: 'table'; head: string[]; rows: RichText[][] }
  | { type: 'quote'; text: RichText }
  /** Абзац, помеченный в исходнике как `**[спорно]**` — лор противоречив. */
  | { type: 'disputed'; text: RichText }

/** Раздел в том виде, в каком его отдаёт парсер markdown. */
export interface ParsedSection {
  /** Стабильный латинский идентификатор, например `horus-heresy`. */
  id: string
  /** Якорь в стиле GitHub — чтобы ссылки внутри лора продолжали работать. */
  anchor: string
  /** Порядковый номер, 1…11. */
  index: number
  /** `ЧАСТЬ V` или null для разделов без нумерации. */
  part: string | null
  /** Заголовок без префикса части. */
  title: string
  /** Полный заголовок как в markdown. */
  fullTitle: string
  /** Короткое название для навигации, взятое из оглавления. */
  navLabel: string
  /** Датировка в скобках под заголовком, если есть. */
  subtitle: string | null
  blocks: Block[]
}

export interface GeneratedContent {
  docTitle: string
  epigraph: string | null
  sections: ParsedSection[]
}

/** Событие на ленте времени. */
export interface TimelineEvent {
  /** Как дата показывается человеку: `999.М41`, `~60 000 000 лет до н.э.` */
  date: string
  /**
   * Год для сортировки, в имперской шкале: (тысячелетие − 1) × 1000 + год.
   * `005.М31` → 30005, `999.М41` → 40999. Для доисторических — отрицательный.
   */
  year: number
  title: string
  /** Одно предложение сути. */
  summary: string
  /** Ключевые события выделяются на ленте. */
  major?: boolean
}

export interface SectionImage {
  /** Путь к локальной копии в public/img. */
  src: string
  /** Ссылка на исходник, по которой файл скачан. Нужна scripts/fetch-images.mjs. */
  remote: string
  alt: string
  caption: string
  /** `hero` — крупный кадр в шапке раздела, `inline` — по ходу текста. */
  role: 'hero' | 'inline'
  width: number
  height: number
  /**
   * Порядковый номер подзаголовка (`### …`) внутри раздела, после которого
   * встаёт картинка. Так четыре бога Хаоса попадают каждый под свой абзац,
   * а не туда, куда придётся. Без значения — картинка уходит в конец раздела.
   */
  afterHeading?: number
}

/** Редакторский слой поверх разобранного текста. */
export interface SectionMeta {
  /** Подпись эпохи для навигации и ленты: `М30 — М31`. */
  era: string
  /**
   * Позиция раздела на сквозной ленте времени.
   * null — раздел тематический (Хаос, Ксеносы, Главная мысль), вне хронологии.
   */
  year: number | null
  /** Одно предложение о разделе — показывается в навигации и под заголовком. */
  lead: string
  /** Акцентный цвет раздела (CSS-значение). */
  accent: string
  events: TimelineEvent[]
}

/** Итоговый раздел: текст + редакторский слой + картинки. */
export interface Section extends ParsedSection, SectionMeta {
  images: SectionImage[]
  hero: SectionImage | null
}
