import { useEffect, useState } from 'react'

/**
 * Отслеживает, какой раздел сейчас читают.
 *
 * Активным считается раздел, пересекающий горизонтальную полосу примерно
 * на трети экрана сверху. Полоса, а не точка, — чтобы короткие разделы
 * тоже успевали стать активными, и чтобы значение не дребезжало на границе.
 *
 * Последнее известное значение сохраняется: у самого верха и низа страницы
 * полосу не пересекает никто, и сбрасывать подсветку в этот момент незачем.
 */
export function useScrollSpy(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(ids[0] ?? null)

  useEffect(() => {
    if (ids.length === 0) return

    const visible = new Set<string>()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id
          if (entry.isIntersecting) visible.add(id)
          else visible.delete(id)
        }
        // Из всех попавших в полосу берём первый по порядку документа.
        const first = ids.find((id) => visible.has(id))
        if (first) setActive(first)
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: 0 },
    )

    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((n): n is HTMLElement => n !== null)

    nodes.forEach((n) => observer.observe(n))
    return () => observer.disconnect()
  }, [ids])

  return active
}
