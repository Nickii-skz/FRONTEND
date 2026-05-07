import type { Customer } from '@domain/entities/Customer'

export interface ICustomerRepository {
  search(query: string): Promise<Customer[]>
  findById(id: string): Promise<Customer | null>
  create(data: Omit<Customer, 'id'>): Promise<Customer>
}
