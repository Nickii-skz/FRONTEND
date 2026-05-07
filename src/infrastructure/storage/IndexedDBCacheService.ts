import { openDB, type IDBPDatabase } from 'idb'
import type { ICacheService } from '@application/ports/outbound/ICacheService'

const DB_NAME = 'pos-cache'
const DB_VERSION = 1
const STORE_NAME = 'cache'

interface CacheEntry<T> {
  value: T
  expiresAt?: number
}

/**
 * IndexedDB-based cache service for offline data persistence.
 * Implements the ICacheService interface for use in the application layer.
 */
export class IndexedDBCacheService implements ICacheService {
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
        // Create the cache store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME)
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
      throw new Error('Failed to initialize IndexedDB')
    }
    return this.db
  }

  /**
   * Retrieve a value from the cache by key.
   * Returns null if the key doesn't exist or has expired.
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const db = await this.ensureDb()
      const entry = await db.get(STORE_NAME, key) as CacheEntry<T> | undefined

      if (!entry) return null

      // Check if entry has expired
      if (entry.expiresAt && Date.now() > entry.expiresAt) {
        await this.delete(key)
        return null
      }

      return entry.value
    } catch (error) {
      // Handle IndexedDB errors gracefully (e.g., quota exceeded, blocked)
      console.error('IndexedDBCacheService.get error:', error)
      return null
    }
  }

  /**
   * Store a value in the cache with an optional TTL.
   * @param key - The cache key
   * @param value - The value to store
   * @param ttlSeconds - Optional time-to-live in seconds
   */
  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      const db = await this.ensureDb()
      const entry: CacheEntry<T> = {
        value,
        expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined,
      }
      await db.put(STORE_NAME, entry, key)
    } catch (error) {
      // Handle IndexedDB errors gracefully
      console.error('IndexedDBCacheService.set error:', error)
      // Don't throw - cache failures should not break the application
    }
  }

  /**
   * Delete a value from the cache by key.
   */
  async delete(key: string): Promise<void> {
    try {
      const db = await this.ensureDb()
      await db.delete(STORE_NAME, key)
    } catch (error) {
      console.error('IndexedDBCacheService.delete error:', error)
    }
  }

  /**
   * Clear all values from the cache.
   */
  async clear(): Promise<void> {
    try {
      const db = await this.ensureDb()
      await db.clear(STORE_NAME)
    } catch (error) {
      console.error('IndexedDBCacheService.clear error:', error)
    }
  }
}
