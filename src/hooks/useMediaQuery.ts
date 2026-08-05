import { useEffect, useState } from 'react'

/**
 * Подписка на медиавыражение.
 *
 * Нужна там, где от устройства зависит не оформление, а сама разметка:
 * CSS умеет спрятать элемент, но не умеет убрать его из обхода
 * клавиатурой или превратить ссылку в обычный текст.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  )

  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}
