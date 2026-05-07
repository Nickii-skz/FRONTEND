import { useState, type FormEvent } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'

export function LockScreen() {
  const { session, unlock, logout } = useAuth()
  const [pin, setPin]     = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleUnlock = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const ok = await unlock(pin)
    setLoading(false)
    if (!ok) {
      setError('Incorrect PIN. Try again.')
      setPin('')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-blue-900 text-white"
      role="dialog"
      aria-modal="true"
      aria-label="Screen locked"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-gray-900 shadow-2xl">
        <div className="mb-6 text-center">
          <span className="text-5xl">🔒</span>
          <h1 className="mt-3 text-xl font-bold">Screen Locked</h1>
          {session && (
            <p className="mt-1 text-sm text-gray-500">
              {session.name} · {session.registerId}
            </p>
          )}
        </div>

        <form onSubmit={handleUnlock} className="flex flex-col gap-4">
          <Input
            label="PIN to unlock"
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            autoFocus
            placeholder="••••"
            error={error || undefined}
          />
          <Button type="submit" loading={loading} size="lg" className="w-full">
            Unlock
          </Button>
        </form>

        <button
          onClick={logout}
          className="mt-4 w-full text-center text-sm text-gray-400 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded min-h-[44px]"
        >
          Sign out instead
        </button>
      </div>
    </div>
  )
}
