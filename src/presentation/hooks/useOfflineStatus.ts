import { useEffect } from 'react'
import { useUIStore } from '../stores/uiStore'
import { useUseCases } from '@composition-root/UseCaseContext'

export function useOfflineStatus() {
  const { setOffline, setSyncing, showNotification } = useUIStore()
  const { syncOfflineQueue } = useUseCases()

  useEffect(() => {
    const handleOffline = () => {
      setOffline(true)
      showNotification('You are offline. Sales will be queued.', 'info')
    }

    const handleOnline = async () => {
      setOffline(false)
      setSyncing(true)
      try {
        const result = await syncOfflineQueue.execute()
        if (result.synced > 0) {
          showNotification(`Synced ${result.synced} transaction(s)`, 'success')
        }
        if (result.failed > 0) {
          showNotification(`${result.failed} transaction(s) failed to sync`, 'error')
        }
      } finally {
        setSyncing(false)
      }
    }

    // Set initial state
    setOffline(!navigator.onLine)

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [setOffline, setSyncing, showNotification, syncOfflineQueue])
}
