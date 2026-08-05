import { useEffect, useState } from 'react'

/**
 * Отслеживает, какой раздел сейчас читают.
 *
 * Активным считается раздел, пересекающий горизонтальную полосу примерно
 * на трети экрана сверху. Полоса, а не точка, — чтобы короткие разделы
 * тоже успевали стать активными, и чтобы значение не дребезжало на границе.
 *
 * Внизу документа полосу не пересекает никто — там подсветка удерживается
 * на последнем разделе. А вот выше первого раздела (титульный экран,
 * обзорная хронология) удерживать нечего: там подсветка снимается, иначе
 * в самом верху страницы горит последний раздел, до которого дочитали.
 */
export function useScrollSpy(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(null)

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
        if (first) {
          setActive(first)
          return
        }
        // Ничего не пересекает: если первый раздел ещё ниже полосы, значит
        // мы над содержанием — гасим подсветку. Иначе оставляем как было.
        const head = document.getElementById(ids[0])
        if (head && head.getBoundingClientRect().top > window.innerHeight * 0.3) {
          setActive(null)
        }
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
