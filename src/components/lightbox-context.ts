import { createContext, useContext } from 'react'

export interface LightboxApi {
  /** Открыть попап на картинке с этим `src`. */
  open: (src: string) => void
}

/**
 * Контекст вынесен из Lightbox.tsx отдельным модулем: файл, который
 * экспортирует и компоненты, и хук, ломает hot reload в Vite.
 */
export const LightboxContext = createContext<LightboxApi>({ open: () => {} })

export const useLightbox = () => useContext(LightboxContext)
