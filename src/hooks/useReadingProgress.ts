import { useEffect, useState } from 'react'

/**
 * Доля прочитанного, 0…1 — по структуре документа, а не по пикселям.
 *
 * Пиксельный вариант (scrollY / высота документа) при ленивой подгрузке
 * врёт: когда в DOM два раздела из одиннадцати, низ страницы показывает
 * 100%. Поэтому считаем иначе: номер раздела, который сейчас читают, плюс
 * доля пройденного внутри него, делённые на общее число разделов.
 * Значение не зависит от того, сколько разделов уже построено.
 *
 * @param ids   идентификаторы смонтированных разделов, по порядку
 * @param total общее число разделов, включая ещё не смонтированные
 */
export function useReadingProgress(ids: string[], total: number): number {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let frame = 0

    const measure = () => {
      frame = 0
      if (total === 0) return

      // Точка отсчёта — треть экрана сверху, та же, что у подсветки разделов
      const anchor = window.innerHeight * 0.3
      let index = -1
      let fraction = 0

      for (let i = 0; i < ids.length; i++) {
        const el = document.getElementById(ids[i])
        if (!el) continue
        const rect = el.getBoundingClientRect()
        if (rect.top <= anchor) {
          index = i
          fraction = rect.height > 0 ? (anchor - rect.top) / rect.height : 0
        } else break
      }

      if (index === -1) {
        // Читатель ещё выше первого раздела — на титульном экране
        setProgress(0)
        return
      }

      // У конца документа последний раздел уже не может уехать выше точки
      // отсчёта, и формула замирает около 98%. Дотягиваем до ста.
      const bottom = document.documentElement.scrollHeight - window.innerHeight
      if (bottom > 0 && bottom - window.scrollY < 4) {
        setProgress(1)
        return
      }

      const clamped = Math.min(1, Math.max(0, fraction))
      setProgress(Math.min(1, (index + clamped) / total))
    }

    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      if (frame !== 0) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [ids, total])

  return progress
}
