import { Ok, type Result } from '@domain/Result'
import type { DomainError } from '@domain/errors/DomainError'
import type { Customer } from '@domain/entities/Customer'
import type { ICustomerRepository } from '@application/ports/outbound/ICustomerRepository'

export class SearchCustomerUseCase {
  constructor(private readonly customerRepo: ICustomerRepository) {}

  async execute(query: string): Promise<Result<Customer[], DomainError>> {
    const results = await this.customerRepo.search(query)
    return Ok(results)
  }
}
