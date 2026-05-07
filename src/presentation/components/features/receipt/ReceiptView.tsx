import { useState } from 'react'
import { Modal } from '../../ui/Modal'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'
import { useCartStore } from '../../../stores/cartStore'
import { useUIStore } from '../../../stores/uiStore'
import { useUseCases } from '@composition-root/UseCaseContext'

interface ReceiptViewProps {
  isOpen: boolean
  onClose: () => void
}

export function ReceiptView({ isOpen, onClose }: ReceiptViewProps) {
  const { lastReceipt } = useCartStore()
  const { showNotification } = useUIStore()
  const { emailService } = useUseCases()
  const [emailInput, setEmailInput] = useState('')
  const [showEmail, setShowEmail] = useState(false)
  const [sending, setSending] = useState(false)

  const receipt = lastReceipt
  if (!receipt) return null

  const handlePrint = () => {
    window.print()
  }

  const handleEmail = async () => {
    if (!emailInput.trim()) return
    setSending(true)
    try {
      await emailService.sendReceipt(receipt, emailInput.trim())
      showNotification(`Receipt sent to ${emailInput}`, 'success')
      setShowEmail(false)
      setEmailInput('')
    } catch (_err) {
      showNotification('Failed to send email. Try again.', 'error')
    } finally {
      setSending(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Receipt" size="md">
      <div className="flex flex-col gap-4">
        {/* Receipt content */}
        <div
          id="receipt-print-area"
          className="rounded-xl border bg-gray-50 p-4 font-mono text-sm"
          aria-label="Receipt details"
        >
          {/* Header */}
          <div className="text-center border-b pb-3 mb-3">
            <p className="font-bold text-lg">🛒 SuperPOS</p>
            <p className="text-xs text-gray-500">Register {receipt.registerId}</p>
            <p className="text-xs text-gray-500">Cashier: {receipt.cashierName}</p>
            <p className="text-xs text-gray-500">
              {receipt.issuedAt.toLocaleString()}
            </p>
            <p className="mt-1 font-bold">{receipt.orderNumber}</p>
          </div>

          {/* Line items */}
          <div className="space-y-1 border-b pb-3 mb-3">
            {receipt.lines.map((line) => (
              <div key={line.id} className="flex justify-between text-xs">
                <span className="flex-1 truncate">
                  {line.product.name} × {line.quantity}
                </span>
                <span className="ml-2 shrink-0">
                  {line.unitPrice.multiplyByScalar(line.quantity).format()}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{receipt.subtotal.format()}</span>
            </div>
            {receipt.totalDiscounts.amount > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Discount</span>
                <span>−{receipt.totalDiscounts.format()}</span>
              </div>
            )}
            {receipt.totalTaxes.amount > 0 && (
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{receipt.totalTaxes.format()}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-1 font-bold text-base">
              <span>TOTAL</span>
              <span>{receipt.total.format()}</span>
            </div>
          </div>

          {/* Payments */}
          <div className="mt-3 border-t pt-3 space-y-1 text-xs">
            {receipt.payments.map((p, i) => (
              <div key={i} className="flex justify-between">
                <span className="capitalize">{p.method}</span>
                <span>{p.amount.format()}</span>
              </div>
            ))}
            {receipt.change.amount > 0 && (
              <div className="flex justify-between text-green-700 font-medium">
                <span>Change</span>
                <span>{receipt.change.format()}</span>
              </div>
            )}
          </div>

          {/* Customer */}
          {receipt.customer && (
            <div className="mt-3 border-t pt-3 text-xs text-center text-gray-500">
              Customer: {receipt.customer.name}
            </div>
          )}

          <p className="mt-3 text-center text-xs text-gray-400">
            Thank you for your purchase!
          </p>
        </div>

        {/* Email input */}
        {showEmail && (
          <div className="flex gap-2">
            <Input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="customer@email.com"
              aria-label="Customer email address"
              className="flex-1"
            />
            <Button onClick={handleEmail} loading={sending} size="sm">
              Send
            </Button>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handlePrint} className="flex-1">
            🖨 Print
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShowEmail((v) => !v)}
            className="flex-1"
          >
            ✉️ Email
          </Button>
          <Button onClick={onClose} className="flex-1">
            New Sale
          </Button>
        </div>
      </div>
    </Modal>
  )
}
