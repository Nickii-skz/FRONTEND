import { useState } from 'react'
import { Modal } from '../../ui/Modal'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'
import { useUseCases } from '@composition-root/UseCaseContext'
import type { Receipt } from '@domain/entities/Receipt'

interface EmailReceiptModalProps {
  isOpen: boolean
  onClose: () => void
  receipt: Receipt | null
}

export function EmailReceiptModal({ isOpen, onClose, receipt }: EmailReceiptModalProps) {
  const { emailService } = useUseCases()
  const [email, setEmail] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSend = async () => {
    if (!receipt) {
      setError('No receipt available')
      return
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    setIsSending(true)
    setError(null)

    try {
      await emailService.sendReceipt(receipt, email.trim())
      setSuccess(true)
      setTimeout(() => {
        handleClose()
      }, 1500)
    } catch {
      setError('Failed to send email. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  const handleClose = () => {
    setEmail('')
    setError(null)
    setSuccess(false)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Email Receipt">
      <div className="min-w-[320px]">
        {success ? (
          <div className="py-6 text-center">
            <p className="text-4xl">✅</p>
            <p className="mt-2 font-medium text-green-600">Receipt sent!</p>
          </div>
        ) : (
          <>
            <Input
              label="Email address"
              type="email"
              placeholder="customer@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error || undefined}
              disabled={isSending}
            />

            <div className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" onClick={handleClose} disabled={isSending}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSend} disabled={isSending}>
                {isSending ? 'Sending...' : 'Send Receipt'}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
