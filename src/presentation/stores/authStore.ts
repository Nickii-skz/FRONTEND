import { create } from 'zustand'
import type { OperatorSession } from '@application/ports/outbound/IAuthService'

interface AuthState {
  session: OperatorSession | null
  isLocked: boolean
  setSession: (session: OperatorSession) => void
  clearSession: () => void
  lockScreen: () => void
  unlockScreen: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isLocked: false,

  setSession: (session) => set({ session, isLocked: false }),

  clearSession: () => set({ session: null, isLocked: false }),

  lockScreen: () => set({ isLocked: true }),

  unlockScreen: () => set({ isLocked: false }),
}))
