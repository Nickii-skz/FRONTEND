import { memo, useState } from 'react'
import type { OrderLine } from '@domain/entities/OrderLine'
import { calcLineSubtotal } from '@domain/entities/OrderLine'

interface OrderLineItemProps {
  line: OrderLine
  onUpdateQty: (lineId: string, qty: number) => void
}

export const OrderLineItem = memo(function OrderLineItem({ line, onUpdateQty }: OrderLineItemProps) {
  const [showNote, setShowNote] = useState(false)
  const subtotal = calcLineSubtotal(line)

  return (
    <li className="flex flex-col gap-1 border-b py-2 last:border-0">
      <div className="flex items-start justify-between gap-2">
        {/* Product info */}
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium text-gray-800">{line.product.name}</p>
          <p className="text-xs text-gray-400">{line.product.sku.value}</p>
        </div>

        {/* Subtotal */}
        <p className="shrink-0 text-sm font-semibold text-gray-900">
          {subtotal.format()}
        </p>
      </div>

      {/* Quantity controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onUpdateQty(line.id, line.quantity - 1)}
          aria-label={`Decrease quantity of ${line.product.name}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 min-w-[44px] min-h-[44px]"
        >
          −
        </button>

        <span
          aria-label={`Quantity: ${line.quantity}`}
          className="w-8 text-center text-sm font-medium"
        >
          {line.quantity}
        </span>

        <button
          onClick={() => onUpdateQty(line.id, line.quantity + 1)}
          aria-label={`Increase quantity of ${line.product.name}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 min-w-[44px] min-h-[44px]"
        >
          +
        </button>

        <span className="text-xs text-gray-400">× {line.unitPrice.format()}</span>

        {/* Note toggle */}
        <button
          onClick={() => setShowNote((v) => !v)}
          aria-label="Add note to this item"
          className="ml-auto text-xs text-gray-400 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded min-h-[44px] px-1"
        >
          📝
        </button>

        {/* Remove */}
        <button
          onClick={() => onUpdateQty(line.id, 0)}
          aria-label={`Remove ${line.product.name} from cart`}
          className="text-xs text-red-400 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded min-h-[44px] px-1"
        >
          🗑
        </button>
      </div>

      {/* Note input */}
      {showNote && (
        <input
          type="text"
          defaultValue={line.note ?? ''}
          placeholder="Add a note…"
          aria-label={`Note for ${line.product.name}`}
          className="mt-1 w-full rounded-lg border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
      )}
    </li>
  )
})
