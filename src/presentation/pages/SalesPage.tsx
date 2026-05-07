import { useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AppShell } from '../components/layout/AppShell'
import { SearchBar } from '../components/features/catalog/SearchBar'
import { CategoryTabs } from '../components/features/catalog/CategoryTabs'
import { ProductGrid } from '../components/features/catalog/ProductGrid'
import { Cart } from '../components/features/cart/Cart'
import { PaymentModal } from '../components/features/payment/PaymentModal'
import { ReceiptView } from '../components/features/receipt/ReceiptView'
import { LockScreen } from '../components/features/auth/LockScreen'
import { useProductSearch } from '../hooks/useProductSearch'
import { useUIStore } from '../stores/uiStore'
import { useAuthStore } from '../stores/authStore'
import { useUseCases } from '@composition-root/UseCaseContext'

export function SalesPage() {
  const searchRef = useRef<HTMLInputElement>(null)
  const { activeModal, closeModal } = useUIStore()
  const { isLocked } = useAuthStore()
  // productRepo is exposed from container for direct category fetching
  const { productRepo } = useUseCases()

  const {
    query, setQuery,
    products, isLoading, error,
    selectedCategory, setSelectedCategory,
    addProduct,
  } = useProductSearch()

  // Fetch categories — productRepo is stable (singleton from container)
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productRepo.getCategories(),
    staleTime: Infinity,
  })

  return (
    <>
      {isLocked && <LockScreen />}

      <AppShell searchInputRef={searchRef}>
        <div className="flex h-full gap-0">

          {/* LEFT: Product catalog */}
          <div className="flex flex-1 flex-col gap-3 overflow-hidden border-r bg-gray-50 p-3">
            <SearchBar
              ref={searchRef}
              value={query}
              onChange={setQuery}
              isLoading={isLoading}
            />

            <CategoryTabs
              categories={categories}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />

            <div className="flex-1 overflow-y-auto">
              <ProductGrid
                products={products}
                isLoading={isLoading}
                error={error}
                onAdd={addProduct}
              />
            </div>
          </div>

          {/* RIGHT: Cart */}
          <div className="w-80 shrink-0 xl:w-96">
            <Cart />
          </div>
        </div>
      </AppShell>

      {/* Modals */}
      <PaymentModal
        isOpen={activeModal === 'payment'}
        onClose={closeModal}
      />
      <ReceiptView
        isOpen={activeModal === 'receipt'}
        onClose={closeModal}
      />
    </>
  )
}
