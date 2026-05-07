import { Ok, Err, type Result } from '@domain/Result'
import { ProductNotFoundError } from '@domain/errors/DomainError'
import { resumeOrder, type Order } from '@domain/entities/Order'
import type { IOrderRepository } from '@application/ports/outbound/IOrderRepository'

export class ResumeOrderUseCase {
  constructor(private readonly orderRepo: IOrderRepository) {}

  async execute(heldOrderId: string): Promise<Result<Order, ProductNotFoundError>> {
    const order = await this.orderRepo.findById(heldOrderId)
    if (!order) return Err(new ProductNotFoundError(heldOrderId))

    const resumed = resumeOrder(order)
    await this.orderRepo.save(resumed)
    return Ok(resumed)
  }
}
