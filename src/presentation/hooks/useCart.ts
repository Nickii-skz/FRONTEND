import { useCallback, useEffect } from 'react'
import { useCartStore } from '../stores/cartStore'
import { useUIStore } from '../stores/uiStore'
import { useUseCases } from '@composition-root/UseCaseContext'
import { calcTotal, calcSubtotal, calcOrderDiscounts, calcTaxableBase, calcTotalTaxes } from '@domain/entities/Order'
import type { Discount } from '@domain/value-objects/Discount'

const DEFAULT_CURRENCY = 'USD'

export function useCart() {
  const { updateOrderLine, applyDiscount, holdOrder, resumeOrder } = useUseCases()
  const { activeOrder, heldOrders, setActiveOrder, addHeldOrder, removeHeldOrder } = useCartStore()
  const { openModal, showNotification } = useUIStore()

  const updateLine = useCallback(
    async (lineId: string, quantity: number) => {
      if (!activeOrder) return
      const result = await updateOrderLine.execute({
        orderId: activeOrder.id,
        lineId,
        quantity,
      })
      if (result.ok) setActiveOrder(result.value)
    },
    [activeOrder, updateOrderLine, setActiveOrder]
  )

  const applyDisc = useCallback(
    async (discount: Discount, supervisorPin?: string, supervisorId?: string) => {
      if (!activeOrder) return false
      const result = await applyDiscount.execute({
        orderId: activeOrder.id,
        discount,
        supervisorPin,
        supervisorId,
      })
      if (result.ok) {
        setActiveOrder(result.value)
        showNotification('Discount applied', 'success')
        return true
      }
      showNotification(result.error.message, 'error')
      return false
    },
    [activeOrder, applyDiscount, setActiveOrder, showNotification]
  )

  const hold = useCallback(async () => {
    if (!activeOrder) return
    const result = await holdOrder.execute(activeOrder.id, DEFAULT_CURRENCY)
    if (result.ok) {
      addHeldOrder(result.value.heldOrder)
      setActiveOrder(result.value.newActiveOrder)
      showNotification('Order held', 'info')
    }
  }, [activeOrder, holdOrder, addHeldOrder, setActiveOrder, showNotification])

  const resume = useCallback(
    async (orderId: string) => {
      const result = await resumeOrder.execute(orderId)
      if (result.ok) {
        setActiveOrder(result.value)
        removeHeldOrder(orderId)
      }
    },
    [resumeOrder, setActiveOrder, removeHeldOrder]
  )

  // Listen for F2 hold event
  useEffect(() => {
    const handleHoldEvent = () => hold()
    document.addEventListener('pos:hold-order', handleHoldEvent)
    return () => document.removeEventListener('pos:hold-order', handleHoldEvent)
  }, [hold])

  const totals = activeOrder
    ? {
        subtotal: calcSubtotal(activeOrder),
        discounts: calcOrderDiscounts(activeOrder),
        taxableBase: calcTaxableBase(activeOrder),
        taxes: calcTotalTaxes(activeOrder),
        total: calcTotal(activeOrder),
      }
    : null

  return {
    order: activeOrder,
    heldOrders,
    totals,
    updateLine,
    applyDiscount: applyDisc,
    hold,
    resume,
    openPayment: () => openModal('payment'),
    openDiscount: () => openModal('discount'),
  }
}
