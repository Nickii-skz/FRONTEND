import { Ok, type Result } from '@domain/Result'
import type { Product } from '@domain/entities/Product'
import type { IProductRepository } from '@application/ports/outbound/IProductRepository'
import type { ICacheService } from '@application/ports/outbound/ICacheService'
import type { DomainError } from '@domain/errors/DomainError'

const CATALOG_CACHE_KEY = 'product_catalog'
const CATALOG_TTL_SECONDS = 60 * 60 // 1 hour

export interface SearchProductsInput {
  query: string
  category?: string
  isOffline?: boolean
}

export class SearchProductsUseCase {
  constructor(
    private readonly productRepo: IProductRepository,
    private readonly cache: ICacheService
  ) {}

  async execute(input: SearchProductsInput): Promise<Result<Product[], DomainError>> {
    if (input.isOffline) {
      const cached = await this.cache.get<Product[]>(CATALOG_CACHE_KEY)
      const products = cached ?? []
      return Ok(this.filterProducts(products, input))
    }

    const products = input.query.trim()
      ? await this.productRepo.search(input.query)
      : await this.productRepo.findAll({ category: input.category })

    // Persist to cache for offline use
    if (!input.query.trim()) {
      await this.cache.set(CATALOG_CACHE_KEY, products, CATALOG_TTL_SECONDS)
    }

    return Ok(this.filterProducts(products, input))
  }

  private filterProducts(products: Product[], input: SearchProductsInput): Product[] {
    let result = products
    if (input.query.trim()) {
      const q = input.query.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.value.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      )
    }
    if (input.category) {
      result = result.filter((p) => p.category === input.category)
    }
    return result
  }
}
