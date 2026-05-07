import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Spinner } from '../components/ui/Spinner'
import { useAuthStore } from '../stores/authStore'
import { useShiftStore } from '../stores/shiftStore'
import { Money } from '@domain/value-objects/Money'
import { useUseCases } from '@composition-root/UseCaseContext'

export function ShiftOpenPage() {
  const navigate = useNavigate()
  const { session } = useAuthStore()
  const { openShift, isOpening } = useShiftStore()
  const { shiftRepo } = useUseCases()
  const [amount, setAmount] = useState('')
  const [registerId, setRegisterId] = useState('REGISTER-01')
  const [error, setError] = useState<string | null>(null)

  const handleOpenShift = async () => {
    if (!session) {
      navigate('/login')
      return
    }

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum < 0) {
      setError('Please enter a valid opening amount')
      return
    }

    setError(null)

    try {
      const openingAmount = Money.fromCents(Math.round(amountNum * 100), 'USD')
      
      // Create shift directly via repository
      const shift = {
        id: crypto.randomUUID(),
        registerId,
        cashierId: session.operatorId,
        cashierName: session.name,
        openingAmount,
        openedAt: new Date(),
        status: 'open' as const,
        movements: [],
      }
      
      await shiftRepo.save(shift)
      openShift(shift)
      navigate('/sales')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to open shift'
      setError(message)
    }
  }

  if (!session) {
    return null
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800">Open Shift</h1>
        <p className="mt-1 text-gray-500">
          Welcome, {session.name}
        </p>

        <div className="mt-6 space-y-4">
          <Input
            label="Register"
            value={registerId}
            onChange={(e) => setRegisterId(e.target.value)}
            disabled={isOpening}
          />

          <Input
            label="Opening Cash Amount ($)"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            error={error || undefined}
            disabled={isOpening}
            min="0"
            step="0.01"
          />

          <div className="mt-6 flex gap-3">
            <Button
              variant="secondary"
              onClick={() => navigate('/login')}
              disabled={isOpening}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleOpenShift}
              disabled={isOpening || !amount}
              className="flex-1"
            >
              {isOpening ? <Spinner size="sm" label="Opening..." /> : 'Open Shift'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
