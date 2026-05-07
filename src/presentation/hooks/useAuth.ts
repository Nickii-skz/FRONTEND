import { useCallback } from 'react'
import { useAuthStore } from '../stores/authStore'
import { useUseCases } from '@composition-root/UseCaseContext'
import type { Credentials } from '@application/ports/outbound/IAuthService'

export function useAuth() {
  const { authenticateOperator } = useUseCases()
  const { session, isLocked, setSession, clearSession, lockScreen, unlockScreen } = useAuthStore()

  const login = useCallback(
    async (credentials: Credentials): Promise<string | null> => {
      const result = await authenticateOperator.execute(credentials)
      if (result.ok) {
        setSession(result.value)
        return null
      }
      return 'Invalid credentials. Please try again.'
    },
    [authenticateOperator, setSession]
  )

  const logout = useCallback(() => {
    clearSession()
  }, [clearSession])

  const lock = useCallback(() => lockScreen(), [lockScreen])

  const unlock = useCallback(
    async (pin: string): Promise<boolean> => {
      // For mock: any non-empty PIN unlocks
      if (pin.length >= 4) {
        unlockScreen()
        return true
      }
      return false
    },
    [unlockScreen]
  )

  return { session, isLocked, login, logout, lock, unlock }
}
