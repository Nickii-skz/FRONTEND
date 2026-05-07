import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { LoginForm } from '../components/features/auth/LoginForm'

export function LoginPage() {
  const { session } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (session) navigate('/sales', { replace: true })
  }, [session, navigate])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-900 via-red-950 to-black p-4">
      <div className="w-full max-w-sm rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 p-8 shadow-2xl border border-red-900/30 border-glow">
        <div className="mb-8 text-center">
          <span className="text-5xl">🛒</span>
          <h1 className="mt-3 text-2xl font-bold text-gray-100 text-glow">SuperPOS</h1>
          <p className="mt-1 text-sm text-gray-400">Point of Sale System</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
