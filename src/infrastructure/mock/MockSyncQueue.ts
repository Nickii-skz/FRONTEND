import type { ISyncQueue, OfflineTransaction } from '@application/ports/outbound/ISyncQueue'

export class MockSyncQueue implements ISyncQueue {
  private queue: OfflineTransaction[] = []

  async enqueue(transaction: OfflineTransaction): Promise<void> {
    this.queue.push(transaction)
  }

  async dequeue(): Promise<OfflineTransaction | null> {
    return this.queue.shift() ?? null
  }

  async peek(): Promise<OfflineTransaction[]> {
    return [...this.queue]
  }

  async markFailed(id: string, error: string): Promise<void> {
    const item = this.queue.find((t) => t.id === id)
    if (item) {
      item.lastError = error
      item.attempts++
    }
  }

  async remove(id: string): Promise<void> {
    this.queue = this.queue.filter((t) => t.id !== id)
  }

  async size(): Promise<number> {
    return this.queue.length
  }
}
