import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { useAuthStore } from '../stores/authStore'
import { useUseCases } from '@composition-root/UseCaseContext'
import type { Order } from '@domain/entities/Order'
import { calcTotal } from '@domain/entities/Order'

export function HistoryPage() {
  const navigate = useNavigate()
  const { session } = useAuthStore()
  const { orderRepo } = useUseCases()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    setIsLoading(true)
    try {
      const allOrders = await orderRepo.findAll()
      const completedOrders = allOrders
        .filter(o => o.status === 'completed')
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      setOrders(completedOrders)
    } catch (error) {
      console.error('Failed to load orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))
  }

  if (!session) {
    navigate('/login')
    return null
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <header className="bg-white shadow">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Order History</h1>
            <p className="text-sm text-gray-500">View completed orders</p>
          </div>
          <Button variant="secondary" onClick={() => navigate('/sales')}>
            Back to Sales
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 p-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" label="Loading orders..." />
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow">
            <p className="text-4xl">📋</p>
            <p className="mt-4 text-lg text-gray-600">No completed orders yet</p>
            <Button
              variant="primary"
              onClick={() => navigate('/sales')}
              className="mt-6"
            >
              Start Selling
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => {
              const total = calcTotal(order)
              return (
                <div
                  key={order.id}
                  className="cursor-pointer rounded-lg bg-white p-4 shadow transition-shadow hover:shadow-md"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">
                        Order #{order.id.slice(0, 8)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(order.updatedAt)}
                      </p>
                    </div>
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                      Completed
                    </span>
                  </div>

                  <div className="mt-3 border-t pt-3">
                    <p className="text-sm text-gray-600">
                      {order.lines.length} item{order.lines.length !== 1 ? 's' : ''}
                    </p>
                    <p className="mt-1 text-xl font-bold text-gray-800">
                      {total.format()}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {selectedOrder && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={() => setSelectedOrder(null)}
          >
            <div
              className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Order Details
                  </h2>
                  <p className="text-sm text-gray-500">
                    {formatDate(selectedOrder.updatedAt)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="mt-6 space-y-3">
                {selectedOrder.lines.map((line) => (
                  <div
                    key={line.id}
                    className="flex justify-between border-b pb-3"
                  >
                    <div>
                      <p className="font-medium text-gray-800">
                        {line.productName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {line.quantity} × {line.unitPrice.format()}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-800">
                      {line.subtotal.format()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-2 border-t pt-4">
                <div className="flex justify-between text-lg">
                  <span className="font-semibold text-gray-800">Total:</span>
                  <span className="font-bold text-gray-800">
                    {calcTotal(selectedOrder).format()}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  variant="primary"
                  onClick={() => setSelectedOrder(null)}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
