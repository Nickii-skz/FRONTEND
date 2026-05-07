import type { IOrderRepository } from '@application/ports/outbound/IOrderRepository'
import type { Order, OrderStatus } from '@domain/entities/Order'

export class MockOrderRepository implements IOrderRepository {
  private store = new Map<string, Order>()

  async save(order: Order): Promise<void> {
    this.store.set(order.id, { ...order })
  }

  async findById(id: string): Promise<Order | null> {
    return this.store.get(id) ?? null
  }

  async findActive(): Promise<Order | null> {
    for (const order of this.store.values()) {
      if (order.status === 'active') return order
    }
    return null
  }

  async findHeld(): Promise<Order[]> {
    return [...this.store.values()].filter((o) => o.status === 'held')
  }

  async findByShift(_shiftId: string): Promise<Order[]> {
    return [...this.store.values()].filter((o) => o.status === 'completed')
  }

  async updateStatus(id: string, status: OrderStatus): Promise<void> {
    const order = this.store.get(id)
    if (order) this.store.set(id, { ...order, status })
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id)
  }
}
