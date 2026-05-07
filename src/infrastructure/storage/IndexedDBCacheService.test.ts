import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { IndexedDBCacheService } from './IndexedDBCacheService'

/**
 * Unit tests for IndexedDBCacheService
 * 
 * Note: These tests mock the idb library since jsdom doesn't have a real IndexedDB implementation.
 * For integration tests with a real IndexedDB, use Playwright E2E tests.
 */

// Mock the idb module
vi.mock('idb', () => {
  const store = new Map<string, { value: unknown; expiresAt?: number }>()

  const mockDb = {
    get: vi.fn(async (_storeName: string, key: string) => {
      return store.get(key)
    }),
    put: vi.fn(async (_storeName: string, entry: { value: unknown; expiresAt?: number }, key: string) => {
      store.set(key, entry)
    }),
    delete: vi.fn(async (_storeName: string, key: string) => {
      store.delete(key)
    }),
    clear: vi.fn(async (_storeName: string) => {
      store.clear()
    }),
  }

  return {
    openDB: vi.fn(async () => mockDb),
  }
})

describe('IndexedDBCacheService', () => {
  let cacheService: IndexedDBCacheService

  beforeEach(async () => {
    vi.clearAllMocks()
    cacheService = new IndexedDBCacheService()
    // Allow initialization to complete
    await new Promise(resolve => setTimeout(resolve, 0))
  })

  afterEach(async () => {
    await cacheService.clear()
  })

  describe('get and set', () => {
    it('should return null for non-existent key', async () => {
      const result = await cacheService.get<string>('non-existent')
      expect(result).toBeNull()
    })

    it('should store and retrieve a value', async () => {
      await cacheService.set('test-key', 'test-value')
      const result = await cacheService.get<string>('test-key')
      expect(result).toBe('test-value')
    })

    it('should store and retrieve complex objects', async () => {
      const complexObject = {
        id: '123',
        name: 'Test Product',
        price: 999,
        nested: { foo: 'bar' },
      }
      await cacheService.set('product', complexObject)
      const result = await cacheService.get<typeof complexObject>('product')
      expect(result).toEqual(complexObject)
    })

    it('should overwrite existing value', async () => {
      await cacheService.set('key', 'value1')
      await cacheService.set('key', 'value2')
      const result = await cacheService.get<string>('key')
      expect(result).toBe('value2')
    })

    it('should handle null values', async () => {
      await cacheService.set('null-key', null)
      const result = await cacheService.get<null>('null-key')
      expect(result).toBeNull()
    })
  })

  describe('TTL (time-to-live)', () => {
    it('should return value before TTL expires', async () => {
      await cacheService.set('ttl-key', 'ttl-value', 10) // 10 seconds TTL
      const result = await cacheService.get<string>('ttl-key')
      expect(result).toBe('ttl-value')
    })

    it('should return null after TTL expires', async () => {
      vi.useFakeTimers()

      await cacheService.set('expired-key', 'expired-value', 1) // 1 second TTL

      // Advance time past TTL
      vi.advanceTimersByTime(1500)

      const result = await cacheService.get<string>('expired-key')
      expect(result).toBeNull()

      vi.useRealTimers()
    })

    it('should work without TTL (no expiration)', async () => {
      await cacheService.set('no-ttl', 'permanent')
      const result = await cacheService.get<string>('no-ttl')
      expect(result).toBe('permanent')
    })
  })

  describe('delete', () => {
    it('should remove a stored value', async () => {
      await cacheService.set('delete-key', 'delete-value')
      await cacheService.delete('delete-key')
      const result = await cacheService.get<string>('delete-key')
      expect(result).toBeNull()
    })

    it('should not throw when deleting non-existent key', async () => {
      await expect(cacheService.delete('non-existent')).resolves.not.toThrow()
    })
  })

  describe('clear', () => {
    it('should remove all stored values', async () => {
      await cacheService.set('key1', 'value1')
      await cacheService.set('key2', 'value2')
      await cacheService.set('key3', 'value3')

      await cacheService.clear()

      expect(await cacheService.get<string>('key1')).toBeNull()
      expect(await cacheService.get<string>('key2')).toBeNull()
      expect(await cacheService.get<string>('key3')).toBeNull()
    })

    it('should not throw when clearing empty cache', async () => {
      await expect(cacheService.clear()).resolves.not.toThrow()
    })
  })

  describe('error handling', () => {
    it('should handle concurrent operations gracefully', async () => {
      // Set multiple values concurrently
      await Promise.all([
        cacheService.set('concurrent1', 'value1'),
        cacheService.set('concurrent2', 'value2'),
        cacheService.set('concurrent3', 'value3'),
      ])

      const results = await Promise.all([
        cacheService.get<string>('concurrent1'),
        cacheService.get<string>('concurrent2'),
        cacheService.get<string>('concurrent3'),
      ])

      expect(results).toEqual(['value1', 'value2', 'value3'])
    })
  })
})
