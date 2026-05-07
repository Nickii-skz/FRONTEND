import { useState } from 'react'
import { useCart } from '../../../hooks/useCart'
import { useUIStore } from '../../../stores/uiStore'
import { OrderLineItem } from './OrderLineItem'
import { FinancialBreakdown } from './FinancialBreakdown'
import { DiscountModal } from './DiscountModal'
import { Button } from '../../ui/Button'
import type { Discount } from '@domain/value-objects/Discount'

export function Cart() {
  const { order, heldOrders, totals, updateLine, applyDiscount, hold, openPayment } = useCart()
  const { openModal } = useUIStore()
  const [discountOpen, setDiscountOpen] = useState(false)

  const isEmpty = !order || order.lines.length === 0

  const handleApplyDiscount = async (
    discount: Discount,
    pin?: string,
    supervisorId?: string
  ) => {
    return applyDiscount(discount, pin, supervisorId)
  }

  return (
    <section
      className="flex h-full flex-col bg-white"
      aria-label="Shopping cart"
    >
      {/* Cart header */}
      <div className="border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">
            Cart
            {order && order.lines.length > 0 && (
              <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                {order.lines.length}
              </span>
            )}
          </h2>
          {heldOrders.length > 0 && (
            <button
              onClick={() => openModal('held-orders')}
              className="text-xs text-orange-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 rounded min-h-[44px] px-1"
            >
              {heldOrders.length} held ▸
            </button>
          )}
        </div>
      </div>

      {/* Line items */}
      <div className="flex-1 overflow-y-auto px-4">
        {isEmpty ? (
          <div
            className="flex h-full flex-col items-center justify-center text-gray-300"
            aria-live="polite"
          >
            <span className="text-5xl">🛒</span>
            <p className="mt-2 text-sm">Cart is empty</p>
            <p className="text-xs">Tap a product to add it</p>
          </div>
        ) : (
          <ul
            aria-label="Cart items"
            aria-live="polite"
            aria-atomic="false"
          >
            {order!.lines.map((line) => (
              <OrderLineItem
                key={line.id}
                line={line}
                onUpdateQty={updateLine}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Financial breakdown */}
      {totals && !isEmpty && (
        <div className="border-t px-4 py-3">
          <FinancialBreakdown totals={totals} />
        </div>
      )}

      {/* Action buttons */}
      <div className="border-t px-4 py-3">
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={hold}
            disabled={isEmpty}
            aria-label="Hold order (F2)"
            className="flex-1"
          >
            Hold <kbd className="ml-1 rounded bg-gray-200 px-1 text-xs text-gray-600">F2</kbd>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setDiscountOpen(true)}
            disabled={isEmpty}
            aria-label="Apply discount"
            className="flex-1"
          >
            % Discount
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={openPayment}
            disabled={isEmpty}
            aria-label="Checkout (F4)"
            className="flex-1"
          >
            Pay <kbd className="ml-1 rounded bg-blue-500 px-1 text-xs text-blue-100">F4</kbd>
          </Button>
        </div>
      </div>

      {/* Discount modal */}
      <DiscountModal
        isOpen={discountOpen}
        onClose={() => setDiscountOpen(false)}
        onApply={handleApplyDiscount}
      />
    </section>
  )
}
