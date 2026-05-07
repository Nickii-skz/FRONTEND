import { create } from 'zustand'

export type ModalType = 'payment' | 'discount' | 'receipt' | 'customer' | 'held-orders' | null

export type Theme = 'standard' | 'high-contrast'

interface UIState {
  isOffline: boolean
  isSyncing: boolean
  activeModal: ModalType
  theme: Theme
  notification: { message: string; type: 'success' | 'error' | 'info' } | null
  setOffline: (value: boolean) => void
  setSyncing: (value: boolean) => void
  openModal: (type: ModalType) => void
  closeModal: () => void
  toggleTheme: () => void
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void
  clearNotification: () => void
}

export const useUIStore = create<UIState>((set) => ({
  isOffline: false,
  isSyncing: false,
  activeModal: null,
  theme: 'standard',
  notification: null,

  setOffline: (value) => set({ isOffline: value }),
  setSyncing: (value) => set({ isSyncing: value }),
  openModal: (type) => set({ activeModal: type }),
  closeModal: () => set({ activeModal: null }),
  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === 'standard' ? 'high-contrast' : 'standard',
    })),
  showNotification: (message, type = 'info') =>
    set({ notification: { message, type } }),
  clearNotification: () => set({ notification: null }),
}))
