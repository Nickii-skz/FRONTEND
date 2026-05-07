import { useState, type FormEvent } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'

export function LoginForm() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const err = await login({ username, password })
    setLoading(false)
    if (err) setError(err)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4"
      aria-label="Login form"
      noValidate
    >
      <Input
        label="Username"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        autoComplete="username"
        required
        placeholder="cashier"
      />

      <Input
        label="Password / PIN"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        required
        placeholder="••••"
      />

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <Button type="submit" loading={loading} size="lg" className="w-full">
        Sign In
      </Button>

      <p className="text-center text-xs text-gray-400">
        Demo: <code>cashier / 1234</code> · <code>supervisor / 5678</code>
      </p>
    </form>
  )
}
