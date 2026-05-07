import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Spinner } from '../components/ui/Spinner'
import { useAuthStore } from '../stores/authStore'
import { useShiftStore } from '../stores/shiftStore'
import { Money } from '@domain/value-objects/Money'
import { useUseCases } from '@composition-root/UseCaseContext'

export function ShiftClosePage() {
  const navigate = useNavigate()
  const { session } = useAuthStore()
  const { currentShift, closeShift, isClosing } = useShiftStore()
  const { closeShiftUseCase } = useUseCases()
  const [physicalCount, setPhysicalCount] = useState('')
  const [supervisorPin, setSupervisorPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{
    expected: Money
    physical: Money
    difference: Money
  } | null>(null)

  if (!session || !currentShift) {
    navigate('/login')
    return null
  }

  const handleCloseShift = async () => {
    const countNum = parseFloat(physicalCount)
    if (isNaN(countNum) || countNum < 0) {
      setError('Please enter a valid cash count')
      return
    }

    setError(null)

    try {
      const physical = Money.fromCents(Math.round(countNum * 100), 'USD')
      
      const closeResult = await closeShiftUseCase.execute({
        shiftId: currentShift.id,
        physicalCount: physical,
        supervisorPin: supervisorPin || undefined,
        supervisorId: session.operatorId,
      })

      if (closeResult.ok) {
        setResult({
          expected: closeResult.value.expectedBalance,
          physical: closeResult.value.physicalCount,
          difference: closeResult.value.difference,
        })
        closeShift()
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      } else {
        setError(closeResult.error.message)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to close shift'
      setError(message)
    }
  }

  if (result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
          <div className="text-center">
            <div className="text-5xl">✅</div>
            <h1 className="mt-4 text-2xl font-bold text-gray-800">Shift Closed</h1>
            
            <div className="mt-6 space-y-3 text-left">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Expected:</span>
                <span className="font-semibold">{result.expected.format()}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Physical Count:</span>
                <span className="font-semibold">{result.physical.format()}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Difference:</span>
                <span className={`font-semibold ${
                  result.difference.amount === 0 
                    ? 'text-green-600' 
                    : result.difference.amount > 0 
                    ? 'text-blue-600' 
                    : 'text-red-600'
                }`}>
                  {result.difference.format()}
                </span>
              </div>
            </div>

            <p className="mt-6 text-sm text-gray-500">
              Redirecting to login...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800">Close Shift</h1>
        <p className="mt-1 text-gray-500">
          Register: {currentShift.registerId}
        </p>

        <div className="mt-6 space-y-4">
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-gray-600">Opening Amount</p>
            <p className="text-xl font-semibold text-gray-800">
              {currentShift.openingAmount.format()}
            </p>
          </div>

          <Input
            label="Physical Cash Count ($)"
            type="number"
            placeholder="0.00"
            value={physicalCount}
            onChange={(e) => setPhysicalCount(e.target.value)}
            disabled={isClosing}
            min="0"
            step="0.01"
          />

          <Input
            label="Supervisor PIN (if needed)"
            type="password"
            placeholder="Enter PIN"
            value={supervisorPin}
            onChange={(e) => setSupervisorPin(e.target.value)}
            error={error || undefined}
            disabled={isClosing}
            hint="Required if difference > $50"
          />

          <div className="mt-6 flex gap-3">
            <Button
              variant="secondary"
              onClick={() => navigate('/sales')}
              disabled={isClosing}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCloseShift}
              disabled={isClosing || !physicalCount}
              className="flex-1"
            >
              {isClosing ? <Spinner size="sm" label="Closing..." /> : 'Close Shift'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
