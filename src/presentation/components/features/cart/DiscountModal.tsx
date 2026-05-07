import { useState } from 'react'
import { Modal } from '../../ui/Modal'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'
import { Discount } from '@domain/value-objects/Discount'

const SUPERVISOR_THRESHOLD_PCT = 20  // discounts > 20% require supervisor PIN

interface DiscountModalProps {
  isOpen: boolean
  onClose: () => void
  onApply: (discount: Discount, supervisorPin?: string, supervisorId?: string) => Promise<boolean>
}

export function DiscountModal({ isOpen, onClose, onApply }: DiscountModalProps) {
  const [type, setType]           = useState<'percentage' | 'fixed'>('percentage')
  const [value, setValue]         = useState('')
  const [pin, setPin]             = useState('')
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)

  const numValue = parseFloat(value) || 0
  const needsPin = type === 'percentage' && numValue > SUPERVISOR_THRESHOLD_PCT

  const handleApply = async () => {
    setError('')
    if (!value || numValue <= 0) {
      setError('Enter a valid discount value.')
      return
    }
    if (type === 'percentage' && numValue > 100) {
      setError('Percentage cannot exceed 100%.')
      return
    }
    if (needsPin && pin.length < 4) {
      setError('Supervisor PIN required (min 4 digits).')
      return
    }

    const discount = new Discount({
      id: crypto.randomUUID(),
      type,
      value: type === 'percentage' ? numValue : Math.round(numValue * 100),
      scope: 'order',
      requiresSupervisor: needsPin,
    })

    setLoading(true)
    const ok = await onApply(discount, needsPin ? pin : undefined, needsPin ? 'op-002' : undefined)
    setLoading(false)

    if (ok) {
      setValue('')
      setPin('')
      onClose()
    } else {
      setError('Could not apply discount. Check the supervisor PIN.')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Apply Discount" size="sm">
      <div className="flex flex-col gap-4">
        {/* Type selector */}
        <div className="flex gap-2">
          {(['percentage', 'fixed'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              aria-pressed={type === t}
              className={[
                'flex-1 rounded-lg border py-2 text-sm font-medium transition-colors min-h-[44px]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
                type === t
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50',
              ].join(' ')}
            >
              {t === 'percentage' ? '% Percentage' : '$ Fixed amount'}
            </button>
          ))}
        </div>

        {/* Value input */}
        <Input
          label={type === 'percentage' ? 'Discount (%)' : 'Discount amount ($)'}
          type="number"
          min="0"
          max={type === 'percentage' ? '100' : undefined}
          step={type === 'percentage' ? '1' : '0.01'}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={type === 'percentage' ? 'e.g. 10' : 'e.g. 5.00'}
          error={error && !needsPin ? error : undefined}
        />

        {/* Supervisor PIN */}
        {needsPin && (
          <Input
            label="Supervisor PIN"
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Enter supervisor PIN"
            hint="Discounts above 20% require supervisor authorization"
            error={error || undefined}
          />
        )}

        <div className="flex gap-2 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleApply} loading={loading} className="flex-1">
            Apply
          </Button>
        </div>
      </div>
    </Modal>
  )
}
