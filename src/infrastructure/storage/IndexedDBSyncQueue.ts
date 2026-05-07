import { openDB, type IDBPDatabase } from 'idb'
import type { ISyncQueue, OfflineTransaction } from '@application/ports/outbound/ISyncQueue'

const DB_NAME = 'pos-sync-queue'
const DB_VERSION = 1
const STORE_NAME = 'transactions'

/**
 * IndexedDB-based sync queue for offline transaction persistence.
 * Implements the ISyncQueue interface for use in the application layer.
 *
 * This service queues completed transactions when offline and provides
 * them for synchronization when the connection is restored.
 */
export class IndexedDBSyncQueue implements ISyncQueue {
  private db: IDBPDatabase | null = null
  private initPromise: Promise<void> | null = null

  constructor() {
    // Initialize the database on construction
    this.initPromise = this.init()
  }

  /**
   * Initialize the IndexedDB database.
   * Creates the object store if it doesn't exist.
   */
  private async init(): Promise<void> {
    if (this.db) return

    this.db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Create the transactions store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
          // Create index for sorting by enqueue time
          store.createIndex('enqueuedAt', 'enqueuedAt')
        }
      },
    })
  }

  /**
   * Ensure the database is initialized before operations.
   */
  private async ensureDb(): Promise<IDBPDatabase> {
    if (!this.db) {
      await this.initPromise
    }
    if (!this.db) {
      throw new Error('Failed to initialize IndexedDB sync queue')
    }
    return this.db
  }

  /**
   * Enqueue a transaction for later synchronization.
   * The transaction will be persisted to IndexedDB and survive page refreshes.
   */
  async enqueue(transaction: OfflineTransaction): Promise<void> {
    try {
      const db = await this.ensureDb()
      // Serialize dates for IndexedDB storage
      const serializedTransaction = this.serializeTransaction(transaction)
      await db.put(STORE_NAME, serializedTransaction)
    } catch (error) {
      console.error('IndexedDBSyncQueue.enqueue error:', error)
      // Re-throw critical errors - sync queue failures should be handled by caller
      throw new Error(`Failed to enqueue transaction: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Dequeue the oldest transaction from the queue (FIFO order).
   * Returns null if the queue is empty.
   */
  async dequeue(): Promise<OfflineTransaction | null> {
    try {
      const db = await this.ensureDb()
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const index = store.index('enqueuedAt')

      // Get the oldest transaction (by enqueuedAt)
      const cursor = await index.openCursor()

      if (!cursor) {
        await tx.done
        return null
      }

      const transaction = cursor.value
      await cursor.delete()
      await tx.done

      return this.deserializeTransaction(transaction)
    } catch (error) {
      console.error('IndexedDBSyncQueue.dequeue error:', error)
      return null
    }
  }

  /**
   * Peek at all transactions in the queue without removing them.
   * Returns transactions sorted by enqueue time (oldest first).
   */
  async peek(): Promise<OfflineTransaction[]> {
    try {
      const db = await this.ensureDb()
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const index = store.index('enqueuedAt')

      const transactions: OfflineTransaction[] = []
      let cursor = await index.openCursor()

      while (cursor) {
        transactions.push(this.deserializeTransaction(cursor.value))
        cursor = await cursor.continue()
      }

      await tx.done
      return transactions
    } catch (error) {
      console.error('IndexedDBSyncQueue.peek error:', error)
      return []
    }
  }

  /**
   * Mark a transaction as failed after a sync attempt.
   * Increments the attempt counter and stores the error message.
   */
  async markFailed(id: string, error: string): Promise<void> {
    try {
      const db = await this.ensureDb()
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)

      const transaction = await store.get(id)

      if (transaction) {
        transaction.lastError = error
        transaction.attempts = (transaction.attempts || 0) + 1
        await store.put(transaction)
      }

      await tx.done
    } catch (err) {
      console.error('IndexedDBSyncQueue.markFailed error:', err)
    }
  }

  /**
   * Remove a transaction from the queue by ID.
   * Typically called after successful sync.
   */
  async remove(id: string): Promise<void> {
    try {
      const db = await this.ensureDb()
      await db.delete(STORE_NAME, id)
    } catch (error) {
      console.error('IndexedDBSyncQueue.remove error:', error)
    }
  }

  /**
   * Get the current number of transactions in the queue.
   */
  async size(): Promise<number> {
    try {
      const db = await this.ensureDb()
      return await db.count(STORE_NAME)
    } catch (error) {
      console.error('IndexedDBSyncQueue.size error:', error)
      return 0
    }
  }

  /**
   * Serialize a transaction for IndexedDB storage.
   * Converts Date objects to ISO strings for persistence.
   */
  private serializeTransaction(transaction: OfflineTransaction): Record<string, unknown> {
    return {
      ...transaction,
      enqueuedAt: transaction.enqueuedAt instanceof Date
        ? transaction.enqueuedAt.toISOString()
        : transaction.enqueuedAt,
      order: {
        ...transaction.order,
        createdAt: transaction.order.createdAt instanceof Date
          ? transaction.order.createdAt.toISOString()
          : transaction.order.createdAt,
        updatedAt: transaction.order.updatedAt instanceof Date
          ? transaction.order.updatedAt.toISOString()
          : transaction.order.updatedAt,
      },
    }
  }

  /**
   * Deserialize a transaction from IndexedDB storage.
   * Converts ISO strings back to Date objects.
   */
  private deserializeTransaction(data: Record<string, unknown>): OfflineTransaction {
    return {
      ...data,
      enqueuedAt: typeof data.enqueuedAt === 'string' ? new Date(data.enqueuedAt) : data.enqueuedAt as Date,
      order: {
        ...data.order as Record<string, unknown>,
        createdAt: typeof (data.order as Record<string, unknown>).createdAt === 'string'
          ? new Date((data.order as Record<string, unknown>).createdAt as string)
          : (data.order as Record<string, unknown>).createdAt as Date,
        updatedAt: typeof (data.order as Record<string, unknown>).updatedAt === 'string'
          ? new Date((data.order as Record<string, unknown>).updatedAt as string)
          : (data.order as Record<string, unknown>).updatedAt as Date,
      },
    } as OfflineTransaction
  }
}
