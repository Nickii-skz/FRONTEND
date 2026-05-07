import { useState } from 'react'
import { Modal } from '../../ui/Modal'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'
import { Spinner } from '../../ui/Spinner'
import { useUseCases } from '@composition-root/UseCaseContext'
import type { Customer } from '@domain/entities/Customer'

interface CustomerSearchProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (customer: Customer) => void
}

export function CustomerSearch({ isOpen, onClose, onSelect }: CustomerSearchProps) {
  const { searchCustomer } = useUseCases()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!query.trim()) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await searchCustomer.execute(query.trim())
      if (result.ok) {
        setResults(result.value)
      } else {
        setError(result.error.message)
      }
    } catch {
      setError('Failed to search customers')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelect = (customer: Customer) => {
    onSelect(customer)
    setQuery('')
    setResults([])
    onClose()
  }

  const handleClose = () => {
    setQuery('')
    setResults([])
    setError(null)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Search Customer">
      <div className="min-w-[360px]">
        <div className="flex gap-2">
          <Input
            placeholder="Name, phone, email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button variant="primary" onClick={handleSearch} disabled={isLoading}>
            Search
          </Button>
        </div>

        {error && (
          <p className="mt-2 text-sm text-red-600" role="alert">{error}</p>
        )}

        <div className="mt-4 max-h-[300px] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="md" label="Searching..." />
            </div>
          ) : results.length > 0 ? (
            <ul className="divide-y">
              {results.map((customer) => (
                <li key={customer.id}>
                  <button
                    onClick={() => handleSelect(customer)}
                    className="flex w-full flex-col py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded min-h-[44px] px-1"
                  >
                    <span className="font-medium text-gray-800">{customer.name}</span>
                    <span className="text-sm text-gray-500">
                      {customer.phone || customer.email || 'No contact info'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : query && !isLoading ? (
            <div className="py-8 text-center text-gray-400">
              <p className="text-2xl">🔍</p>
              <p className="mt-1">No customers found</p>
              <p className="text-sm">Try a different search term</p>
            </div>
          ) : null}
        </div>
      </div>
    </Modal>
  )
}
