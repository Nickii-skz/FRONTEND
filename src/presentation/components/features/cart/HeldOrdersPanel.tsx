import { Modal } from '../../ui/Modal'
import { Button } from '../../ui/Button'
import { useCart } from '../../../hooks/useCart'
import type { Order } from '@domain/entities/Order'
import { calcTotal } from '@domain/entities/Order'

interface HeldOrdersPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function HeldOrdersPanel({ isOpen, onClose }: HeldOrdersPanelProps) {
  const { heldOrders, resume } = useCart()

  const handleResume = async (order: Order) => {
    await resume(order.id)
    onClose()
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Held Orders">
      <div className="min-w-[320px]">
        {heldOrders.length === 0 ? (
          <div className="py-8 text-center text-gray-400">
            <p className="text-3xl">📋</p>
            <p className="mt-2">No held orders</p>
          </div>
        ) : (
          <ul className="max-h-[400px] divide-y overflow-y-auto">
            {heldOrders.map((order) => {
              const total = calcTotal(order)
              return (
                <li
                  key={order.id}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <p className="font-medium text-gray-800">
                      {order.lines.length} item{order.lines.length !== 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-gray-500">
                      Held at {formatTime(order.updatedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-800">
                      {total.format()}
                    </span>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleResume(order)}
                    >
                      Resume
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </Modal>
  )
}
