import { useEffect, type RefObject } from 'react'

/**
 * Общее поведение модального окна: блокировка прокрутки фона, закрытие
 * по Escape и ловушка фокуса.
 *
 * Заведено потому, что окон стало два — попап с картинкой и карточка
 * статьи, — и повторять эти сорок строк дважды нет смысла. Логика
 * одинаковая, различаются только дополнительные клавиши: в попапе
 * стрелки листают кадры.
 *
 * Элементы, между которыми ходит фокус, помечаются в разметке
 * атрибутом `data-focusable`.
 */
export function useModal({
  open,
  onClose,
  root,
  onKey,
  focusRef,
}: {
  open: boolean
  onClose: () => void
  /** CSS-селектор корня окна — по нему ищутся элементы ловушки фокуса. */
  root: string
  /** Дополнительная обработка клавиш поверх Escape и Tab. */
  onKey?: (e: KeyboardEvent) => void
  /** Что получает фокус при открытии. */
  focusRef?: RefObject<HTMLElement | null>
}) {
  useEffect(() => {
    if (!open) return

    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key === 'Tab') {
        const list = [...document.querySelectorAll<HTMLElement>(`${root} [data-focusable]`)]
        if (list.length === 0) return
        const first = list[0]
        const last = list[list.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
        return
      }
      onKey?.(e)
    }

    // Блокируем прокрутку фона, компенсируя ширину полосы прокрутки,
    // чтобы страница под окном не дёргалась вбок
    const bar = window.innerWidth - document.documentElement.clientWidth
    const prevOverflow = document.body.style.overflow
    const prevPad = document.body.style.paddingRight
    document.body.style.overflow = 'hidden'
    if (bar > 0) document.body.style.paddingRight = `${bar}px`

    window.addEventListener('keydown', handle)
    focusRef?.current?.focus()

    return () => {
      window.removeEventListener('keydown', handle)
      document.body.style.overflow = prevOverflow
      document.body.style.paddingRight = prevPad
    }
  }, [open, onClose, root, onKey, focusRef])
}
