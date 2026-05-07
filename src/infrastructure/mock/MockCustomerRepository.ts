import type { ICustomerRepository } from '@application/ports/outbound/ICustomerRepository'
import type { Customer } from '@domain/entities/Customer'

const MOCK_CUSTOMERS: Customer[] = [
  { id: 'c-001', name: 'John Smith', email: 'john@example.com', phone: '555-0101' },
  { id: 'c-002', name: 'Jane Doe', email: 'jane@example.com', phone: '555-0102' },
  { id: 'c-003', name: 'Bob Johnson', document: 'ID-12345678' },
]

export class MockCustomerRepository implements ICustomerRepository {
  private customers = [...MOCK_CUSTOMERS]

  async search(query: string): Promise<Customer[]> {
    const q = query.toLowerCase()
    return this.customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.document?.toLowerCase().includes(q)
    )
  }

  async findById(id: string): Promise<Customer | null> {
    return this.customers.find((c) => c.id === id) ?? null
  }

  async create(data: Omit<Customer, 'id'>): Promise<Customer> {
    const customer: Customer = { ...data, id: `c-${Date.now()}` }
    this.customers.push(customer)
    return customer
  }
}
