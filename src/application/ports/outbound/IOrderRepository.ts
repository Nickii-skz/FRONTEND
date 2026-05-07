import type { Order, OrderStatus } from '@domain/entities/Order'

export interface IOrderRepository {
  save(order: Order): Promise<void>
  findById(id: string): Promise<Order | null>
  findActive(): Promise<Order | null>
  findHeld(): Promise<Order[]>
  findByShift(shiftId: string): Promise<Order[]>
  updateStatus(id: string, status: OrderStatus): Promise<void>
  delete(id: string): Promise<void>
}
