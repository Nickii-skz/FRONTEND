import { useEffect } from 'react'
import { useUIStore } from '../stores/uiStore'
import { useCartStore } from '../stores/cartStore'
import { useAuthStore } from '../stores/authStore'

interface ShortcutHandlers {
  onFocusSearch?: () => void
}

export function useKeyboardShortcuts({ onFocusSearch }: ShortcutHandlers = {}) {
  const { openModal, closeModal, activeModal } = useUIStore()
  const { activeOrder } = useCartStore()
  const { lockScreen } = useAuthStore()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase()
      const isInput = tag === 'input' || tag === 'textarea' || tag === 'select'

      // Ctrl+F — focus search (fires even inside inputs)
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault()
        onFocusSearch?.()
        return
      }

      // Remaining shortcuts do NOT fire when focus is inside a text input
      if (isInput) return

      switch (e.key) {
        case 'F4':
          e.preventDefault()
          if (activeOrder && activeOrder.lines.length > 0) {
            openModal('payment')
          }
          break

        case 'F2':
          e.preventDefault()
          if (activeOrder && activeOrder.lines.length > 0) {
            // Trigger hold — handled by useCart hook via store
            document.dispatchEvent(new CustomEvent('pos:hold-order'))
          }
          break

        case 'F8':
          e.preventDefault()
          lockScreen()
          break

        case 'Escape':
          e.preventDefault()
          if (activeModal) closeModal()
          break
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [activeOrder, activeModal, openModal, closeModal, lockScreen, onFocusSearch])
}
