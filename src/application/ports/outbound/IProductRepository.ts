import type { Product } from '@domain/entities/Product'
import type { SKU } from '@domain/value-objects/SKU'

export interface ProductFilters {
  category?: string
  query?: string
  inStock?: boolean
}

export interface IProductRepository {
  findAll(filters?: ProductFilters): Promise<Product[]>
  findBySku(sku: SKU): Promise<Product | null>
  findByCategory(category: string): Promise<Product[]>
  search(query: string): Promise<Product[]>
  getCategories(): Promise<string[]>
}
