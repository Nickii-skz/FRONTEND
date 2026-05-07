import { openDB, type IDBPDatabase } from 'idb'
import type { ISyncQueue, SyncOperation } from '@application/ports/outbound/ISyncQueue'

const DB_NAME = 'pos-sync-queue'
const STORE_NAME = 'operations'
const DB_VERSION = 1

export class IndexedDBSyncQueue implements ISyncQueue {
  private db: IDBPDatabase | null = null

  private async getDB(): Promise<IDBPDatabase> {
    if (this.db) return this.db

    this.db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: 'id',
            autoIncrement: false,
          })
          store.createIndex('timestamp', 'timestamp')
          store.createIndex('status', 'status')
        }
      },
    })

    return this.db
  }

  async enqueue(operation: SyncOperation): Promise<void> {
    const db = await this.getDB()
    await db.put(STORE_NAME, operation)
  }

  async dequeue(): Promise<SyncOperation | null> {
    const db = await this.getDB()
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const index = store.index('timestamp')
    
    const operations = await index.getAll()
    const pending = operations
      .filter(op => op.status === 'pending')
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

    return pending[0] || null
  }

  async markCompleted(operationId: string): Promise<void> {
    const db = await this.getDB()
    const operation = await db.get(STORE_NAME, operationId)
    
    if (operation) {
      operation.status = 'completed'
      await db.put(STORE_NAME, operation)
    }
  }

  async markFailed(operationId: string, error: string): Promise<void> {
    const db = await this.getDB()
    const operation = await db.get(STORE_NAME, operationId)
    
    if (operation) {
      operation.status = 'failed'
      operation.error = error
      operation.retryCount = (operation.retryCount || 0) + 1
      await db.put(STORE_NAME, operation)
    }
  }

  async getPending(): Promise<SyncOperation[]> {
    const db = await this.getDB()
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const index = store.index('status')
    
    return index.getAll('pending')
  }

  async clear(): Promise<void> {
    const db = await this.getDB()
    await db.clear(STORE_NAME)
  }

  async size(): Promise<number> {
    const db = await this.getDB()
    return db.count(STORE_NAME)
  }
}
