import { Spinner } from '../../ui/Spinner'
import { ProductCard } from './ProductCard'
import type { Product } from '@domain/entities/Product'

interface ProductGridProps {
  products: Product[]
  isLoading: boolean
  error: string | null
  onAdd: (product: Product) => void
}

export function ProductGrid({ products, isLoading, error, onAdd }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-12">
        <Spinner size="lg" label="Loading products…" />
      </div>
    )
  }

  if (error) {
    return (
      <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
        <p className="text-2xl">⚠️</p>
        <p className="mt-1 font-medium">{error}</p>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-12 text-gray-400">
        <p className="text-4xl">🔍</p>
        <p className="mt-2 font-medium">No products found</p>
        <p className="text-sm">Try a different search term or category</p>
      </div>
    )
  }

  return (
    <div
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      aria-label="Product catalog"
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onAdd={onAdd} />
      ))}
    </div>
  )
}
