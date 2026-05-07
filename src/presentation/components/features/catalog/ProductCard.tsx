import { memo } from 'react'
import type { Product } from '@domain/entities/Product'

interface ProductCardProps {
  product: Product
  onAdd: (product: Product) => void
}

export const ProductCard = memo(function ProductCard({ product, onAdd }: ProductCardProps) {
  const inStock = product.stock > 0
  const price = product.price.format()

  return (
    <button
      onClick={() => onAdd(product)}
      disabled={!inStock}
      aria-label={`Add ${product.name} — ${price}${!inStock ? ' (out of stock)' : ''}`}
      className={[
        'flex flex-col items-center gap-2 rounded-xl border bg-white p-3 text-left',
        'transition-all duration-150 min-h-[44px] w-full',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
        inStock
          ? 'hover:border-blue-400 hover:shadow-md cursor-pointer'
          : 'opacity-50 cursor-not-allowed',
      ].join(' ')}
    >
      {/* Product image */}
      <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-gray-100">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-2xl">🛍️</span>
        )}
        {/* Stock badge */}
        <span
          className={[
            'absolute bottom-0 right-0 rounded-tl px-1 text-[10px] font-bold',
            inStock ? 'bg-green-500 text-white' : 'bg-red-500 text-white',
          ].join(' ')}
          aria-hidden="true"
        >
          {inStock ? product.stock : '✕'}
        </span>
      </div>

      {/* Info */}
      <div className="w-full text-center">
        <p className="line-clamp-2 text-xs font-medium text-gray-800 leading-tight">
          {product.name}
        </p>
        <p className="mt-1 text-sm font-bold text-blue-700">{price}</p>
        <p className="text-[10px] text-gray-400">{product.sku.value}</p>
      </div>
    </button>
  )
})
