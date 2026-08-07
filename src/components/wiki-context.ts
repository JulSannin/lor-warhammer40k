import { createContext, useContext } from 'react'

/**
 * Контекст вынесен в отдельный файл, чтобы модуль с компонентами
 * экспортировал только компоненты: иначе быстрая перезагрузка Vite
 * при правке сбрасывает состояние всего дерева.
 */
export const WikiContext = createContext<{ open: (term: string) => void } | null>(null)

export function useWiki() {
  const ctx = useContext(WikiContext)
  if (!ctx) throw new Error('WikiTerm используется вне WikiProvider')
  return ctx
}
