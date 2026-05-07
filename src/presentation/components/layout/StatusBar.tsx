import { useUIStore } from '../../stores/uiStore'
import { useCartStore } from '../../stores/cartStore'
import { Badge } from '../ui/Badge'

export function StatusBar() {
  const { isOffline, isSyncing, notification, clearNotification } = useUIStore()
  const { heldOrders } = useCartStore()

  const connectionVariant = isSyncing ? 'syncing' : isOffline ? 'offline' : 'online'
  const connectionLabel   = isSyncing ? 'Syncing…' : isOffline ? 'Offline' : 'Online'

  return (
    <footer className="flex items-center justify-between border-t bg-gray-50 px-4 py-1.5 text-sm">
      {/* Left: connection status */}
      <div className="flex items-center gap-3">
        <Badge variant={connectionVariant} label={connectionLabel} />
        {heldOrders.length > 0 && (
          <Badge variant="warning" label={`${heldOrders.length} held`} />
        )}
      </div>

      {/* Center: notification */}
      {notification && (
        <div
          role="status"
          aria-live="polite"
          className={[
            'flex items-center gap-2 rounded-full px-3 py-0.5 text-xs font-medium',
            notification.type === 'success' ? 'bg-green-100 text-green-800' :
            notification.type === 'error'   ? 'bg-red-100 text-red-800' :
                                              'bg-blue-100 text-blue-800',
          ].join(' ')}
        >
          {notification.message}
          <button
            onClick={clearNotification}
            aria-label="Dismiss notification"
            className="ml-1 text-current opacity-60 hover:opacity-100"
          >
            ×
          </button>
        </div>
      )}

      {/* Right: keyboard hints */}
      <div className="hidden items-center gap-3 text-xs text-gray-400 md:flex">
        <span><kbd className="rounded bg-gray-200 px-1">Ctrl+F</kbd> Search</span>
        <span><kbd className="rounded bg-gray-200 px-1">F2</kbd> Hold</span>
        <span><kbd className="rounded bg-gray-200 px-1">F4</kbd> Pay</span>
        <span><kbd className="rounded bg-gray-200 px-1">F8</kbd> Lock</span>
      </div>
    </footer>
  )
}
