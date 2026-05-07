import { useState, useCallback } from 'react'
import { useCartStore } from '../stores/cartStore'
import { useUIStore } from '../stores/uiStore'
import { useAuthStore } from '../stores/authStore'
import { useUseCases } from '@composition-root/UseCaseContext'
import { calcTotal, createEmptyOrder } from '@domain/entities/Order'
import { Money } from '@domain/value-objects/Money'
import type { PaymentEntry, PaymentMethodType } from '@domain/entities/Receipt'

const DEFAULT_CURRENCY = 'USD'

export function usePayment() {
  const { processPayment } = useUseCases()
  const { activeOrder, setActiveOrder, setLastReceipt } = useCartStore()
  const { closeModal, showNotification, openModal } = useUIStore()
  const { session } = useAuthStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const [payments, setPayments] = useState<PaymentEntry[]>([
    { method: 'cash', amount: Money.zero(DEFAULT_CURRENCY) },
  ])

  const total = activeOrder ? calcTotal(activeOrder) : Money.zero(DEFAULT_CURRENCY)

  const paidTotal = payments.reduce(
    (acc, p) => acc.add(p.amount),
    Money.zero(DEFAULT_CURRENCY)
  )

  const change = paidTotal.isGreaterThanOrEqual(total)
    ? paidTotal.subtract(total)
    : Money.zero(DEFAULT_CURRENCY)

  const pending = total.isGreaterThan(paidTotal)
    ? total.subtract(paidTotal)
    : Money.zero(DEFAULT_CURRENCY)

  const canConfirm = paidTotal.isGreaterThanOrEqual(total) && total.amount > 0

  const updatePayment = useCallback(
    (index: number, amount: Money, method?: PaymentMethodType) => {
      setPayments((prev) =>
        prev.map((p, i) =>
          i === index ? { ...p, amount, ...(method ? { method } : {}) } : p
        )
      )
    },
    []
  )

  const addPaymentMethod = useCallback((method: PaymentMethodType) => {
    setPayments((prev) => [...prev, { method, amount: Money.zero(DEFAULT_CURRENCY) }])
  }, [])

  const removePaymentMethod = useCallback((index: number) => {
    setPayments((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const confirm = useCallback(async () => {
    if (!activeOrder || !canConfirm || !session) return
    setIsProcessing(true)
    try {
      const result = await processPayment.execute({
        orderId: activeOrder.id,
        payments,
        cashierName: session.name,
        registerId: session.registerId,
      })
      if (result.ok) {
        setLastReceipt(result.value)
        setActiveOrder(createEmptyOrder(DEFAULT_CURRENCY))
        closeModal()
        showNotification('Payment confirmed ✓', 'success')
        // Open receipt modal after closing payment modal
        setTimeout(() => openModal('receipt'), 50)
      } else {
        showNotification(result.error.message, 'error')
      }
    } finally {
      setIsProcessing(false)
    }
  }, [
    activeOrder, canConfirm, session, processPayment, payments,
    setLastReceipt, setActiveOrder, closeModal, showNotification, openModal,
  ])

  const reset = useCallback(() => {
    setPayments([{ method: 'cash', amount: Money.zero(DEFAULT_CURRENCY) }])
  }, [])

  return {
    payments,
    total,
    paidTotal,
    change,
    pending,
    canConfirm,
    isProcessing,
    updatePayment,
    addPaymentMethod,
    removePaymentMethod,
    confirm,
    reset,
  }
}
