import { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useUseCases } from '@composition-root/UseCaseContext'
import { useUIStore } from '../stores/uiStore'
import { useCartStore } from '../stores/cartStore'
import { isBarcode } from '@domain/value-objects/SKU'
import { SKU } from '@domain/value-objects/SKU'
import type { Product } from '@domain/entities/Product'

const DEBOUNCE_MS = 300
const DEFAULT_CURRENCY = 'USD'

export function useProductSearch() {
  const { searchProducts, addProductToOrder } = useUseCases()
  const { isOffline } = useUIStore()
  const { setActiveOrder } = useCartStore()
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleQueryChange = useCallback(
    (value: string) => {
      setQuery(value)

      // Barcode: skip debounce
      if (isBarcode(value)) {
        if (debounceRef.current) clearTimeout(debounceRef.current)
        setDebouncedQuery(value)
        return
      }

      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        setDebouncedQuery(value)
      }, DEBOUNCE_MS)
    },
    []
  )

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products', debouncedQuery, selectedCategory, isOffline],
    queryFn: async () => {
      const result = await searchProducts.execute({
        query: debouncedQuery,
        category: selectedCategory,
        isOffline,
      })
      return result.ok ? result.value : []
    },
    staleTime: 30_000,
  })

  // Auto-add on single barcode match
  useEffect(() => {
    if (isBarcode(debouncedQuery) && products.length === 1) {
      const product = products[0]
      try {
        const sku = new SKU(product.sku.value)
        addProductToOrder
          .execute({ sku, quantity: 1, currency: DEFAULT_CURRENCY })
          .then((result) => {
            if (result.ok) {
              setActiveOrder(result.value)
              setQuery('') // Clear search after auto-add
            }
          })
      } catch (_err) {
        // Invalid SKU — ignore
      }
    }
  }, [debouncedQuery, products, addProductToOrder, setActiveOrder, setQuery])

  const addProduct = useCallback(
    async (product: Product, quantity = 1) => {
      try {
        const sku = new SKU(product.sku.value)
        const result = await addProductToOrder.execute({
          sku,
          quantity,
          currency: DEFAULT_CURRENCY,
        })
        if (result.ok) setActiveOrder(result.value)
        return result
      } catch (_err) {
        return null
      }
    },
    [addProductToOrder, setActiveOrder]
  )

  return {
    query,
    setQuery: handleQueryChange,
    products,
    isLoading,
    error: error ? 'Search failed. Please try again.' : null,
    selectedCategory,
    setSelectedCategory,
    addProduct,
  }
}
