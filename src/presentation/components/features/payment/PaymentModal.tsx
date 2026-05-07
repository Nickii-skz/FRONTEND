import { useEffect } from 'react'
import { Modal } from '../../ui/Modal'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'
import { usePayment } from '../../../hooks/usePayment'
import { Money } from '@domain/value-objects/Money'
import type { PaymentMethodType } from '@domain/entities/Receipt'

const METHODS: { id: PaymentMethodType; label: string; icon: string }[] = [
  { id: 'cash',     label: 'Cash',     icon: '💵' },
  { id: 'debit',    label: 'Debit',    icon: '💳' },
  { id: 'credit',   label: 'Credit',   icon: '💳' },
  { id: 'transfer', label: 'Transfer', icon: '🏦' },
  { id: 'qr',       label: 'QR',       icon: '📱' },
]

const DEFAULT_CURRENCY = 'USD'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PaymentModal({ isOpen, onClose }: PaymentModalProps) {
  const {
    payments, total, paidTotal, change, pending,
    canConfirm, isProcessing,
    updatePayment, addPaymentMethod, removePaymentMethod,
    confirm, reset,
  } = usePayment()

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) reset()
  }, [isOpen, reset])

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Payment" size="lg">
      <div className="flex flex-col gap-4">

        {/* Order total */}
        <div className="rounded-xl bg-blue-50 px-4 py-3 text-center">
          <p className="text-sm text-blue-600">Order Total</p>
          <p className="text-3xl font-bold text-blue-800">{total.format()}</p>
        </div>

        {/* Payment entries */}
        <div className="flex flex-col gap-3">
          {payments.map((entry, idx) => (
            <div key={idx} className="flex items-end gap-2">
              {/* Method selector */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Method</label>
                <div className="flex gap-1">
                  {METHODS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => updatePayment(idx, entry.amount, m.id)}
                      aria-pressed={entry.method === m.id}
                      aria-label={m.label}
                      title={m.label}
                      className={[
                        'rounded-lg border p-2 text-lg transition-colors min-h-[44px] min-w-[44px]',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
                        entry.method === m.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50',
                      ].join(' ')}
                    >
                      {m.icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount input */}
              <div className="flex-1">
                <Input
                  label="Amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={entry.amount.amount > 0 ? (entry.amount.amount / 100).toFixed(2) : ''}
                  onChange={(e) => {
                    const cents = Math.round(parseFloat(e.target.value || '0') * 100)
                    updatePayment(idx, new Money(Math.max(0, cents), DEFAULT_CURRENCY))
                  }}
                  placeholder="0.00"
                />
              </div>

              {/* Remove button (only if more than one entry) */}
              {payments.length > 1 && (
                <button
                  onClick={() => removePaymentMethod(idx)}
                  aria-label="Remove this payment method"
                  className="mb-1 rounded-lg border border-red-200 p-2 text-red-400 hover:bg-red-50 min-h-[44px] min-w-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                >
                  🗑
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add payment method */}
        <button
          onClick={() => addPaymentMethod('cash')}
          className="text-sm text-blue-600 hover:underline text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded min-h-[44px]"
        >
          + Add another payment method
        </button>

        {/* Change / Pending */}
        <div className="rounded-xl border bg-gray-50 px-4 py-3 space-y-1">
          {change.amount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Change</span>
              <span className="font-bold text-green-700">{change.format()}</span>
            </div>
          )}
          {pending.amount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pending</span>
              <span className="font-bold text-red-600">{pending.format()}</span>
            </div>
          )}
          <div className="flex justify-between text-sm border-t pt-1">
            <span className="text-gray-600">Paid</span>
            <span className="font-medium">{paidTotal.format()}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button variant="secondary" onClick={onClose} className="flex-1" disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            onClick={confirm}
            loading={isProcessing}
            disabled={!canConfirm}
            className="flex-1"
            aria-label="Confirm payment"
          >
            Confirm Payment
          </Button>
        </div>
      </div>
    </Modal>
  )
}
