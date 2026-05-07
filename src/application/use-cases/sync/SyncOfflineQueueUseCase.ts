import type { ISyncQueue } from '@application/ports/outbound/ISyncQueue'
import type { IOrderRepository } from '@application/ports/outbound/IOrderRepository'

export interface SyncResult {
  synced: number
  failed: number
  errors: string[]
}

export class SyncOfflineQueueUseCase {
  constructor(
    private readonly syncQueue: ISyncQueue,
    private readonly orderRepo: IOrderRepository
  ) {}

  async execute(): Promise<SyncResult> {
    const result: SyncResult = { synced: 0, failed: 0, errors: [] }
    let item = await this.syncQueue.dequeue()

    while (item) {
      try {
        await this.orderRepo.save(item.order)
        await this.syncQueue.remove(item.id)
        result.synced++
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        await this.syncQueue.markFailed(item.id, msg)
        result.failed++
        result.errors.push(msg)
      }
      item = await this.syncQueue.dequeue()
    }

    return result
  }
}
