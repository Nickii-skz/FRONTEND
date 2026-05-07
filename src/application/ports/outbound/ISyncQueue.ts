import type { Order } from '@domain/entities/Order'

export interface OfflineTransaction {
  id: string
  order: Order
  enqueuedAt: Date
  attempts: number
  lastError?: string
}

export interface ISyncQueue {
  enqueue(transaction: OfflineTransaction): Promise<void>
  dequeue(): Promise<OfflineTransaction | null>
  peek(): Promise<OfflineTransaction[]>
  markFailed(id: string, error: string): Promise<void>
  remove(id: string): Promise<void>
  size(): Promise<number>
}
