import { forwardRef } from 'react'
import { Spinner } from '../../ui/Spinner'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  isLoading?: boolean
  placeholder?: string
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  ({ value, onChange, isLoading = false, placeholder = 'Search products or scan barcode…' }, ref) => {
    const isBarcode = /^\d{8,14}$/.test(value)

    return (
      <div className="relative flex items-center">
        {/* Search icon */}
        <span className="pointer-events-none absolute left-3 text-gray-400" aria-hidden="true">
          🔍
        </span>

        <input
          ref={ref}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label="Search products"
          autoComplete="off"
          className={[
            'w-full rounded-xl border py-2.5 pl-10 pr-10 text-base',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'min-h-[44px]',
            isBarcode
              ? 'border-green-400 bg-green-50'
              : 'border-gray-300 bg-white',
          ].join(' ')}
        />

        {/* Right indicator */}
        <span className="absolute right-3">
          {isLoading ? (
            <Spinner size="sm" />
          ) : isBarcode ? (
            <span title="Barcode detected" aria-label="Barcode detected">📷</span>
          ) : null}
        </span>
      </div>
    )
  }
)

SearchBar.displayName = 'SearchBar'
