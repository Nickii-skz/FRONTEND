import { useAuthStore } from '../../stores/authStore'
import { useUIStore } from '../../stores/uiStore'
import { Button } from '../ui/Button'

export function Header() {
  const { session, lockScreen } = useAuthStore()
  const { toggleTheme, theme } = useUIStore()

  if (!session) return null

  return (
    <header className="flex items-center justify-between bg-gradient-to-r from-red-900 to-red-950 px-4 py-2 text-white shadow-lg shadow-black/50 border-b border-red-800">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <span className="text-xl font-bold tracking-tight text-glow">🛒 SuperPOS</span>
        <span className="hidden text-red-300 sm:block">|</span>
        <span className="hidden text-sm text-red-200 sm:block">
          Register <strong>{session.registerId}</strong>
        </span>
      </div>

      {/* Operator info */}
      <div className="flex items-center gap-2 text-sm">
        <span className="hidden text-red-100 md:block">
          {session.name}
        </span>
        <span className="rounded-full bg-red-700 px-2 py-0.5 text-xs font-medium capitalize border border-red-600">
          {session.role}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'standard' ? 'high-contrast' : 'standard'} theme`}
          className="rounded-lg p-2 text-red-100 hover:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
          title="Toggle theme"
        >
          {theme === 'standard' ? '🌙' : '☀️'}
        </button>
        <Button
          variant="ghost"
          size="sm"
          onClick={lockScreen}
          aria-label="Lock screen (F8)"
          className="text-white hover:bg-red-800 min-h-[44px]"
        >
          🔒 Lock
        </Button>
      </div>
    </header>
  )
}
