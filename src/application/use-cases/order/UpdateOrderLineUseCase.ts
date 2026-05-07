import { Ok, Err, type Result } from '@domain/Result'
import { ProductNotFoundError } from '@domain/errors/DomainError'
import { updateLineQuantity, type Order } from '@domain/entities/Order'
import type { IOrderRepository } from '@application/ports/outbound/IOrderRepository'

export interface UpdateLineInput {
  orderId: string
  lineId: string
  quantity: number
}

export class UpdateOrderLineUseCase {
  constructor(private readonly orderRepo: IOrderRepository) {}

  async execute(input: UpdateLineInput): Promise<Result<Order, ProductNotFoundError>> {
    const order = await this.orderRepo.findById(input.orderId)
    if (!order) return Err(new ProductNotFoundError(input.orderId))

    const updated = updateLineQuantity(order, input.lineId, input.quantity)
    await this.orderRepo.save(updated)
    return Ok(updated)
  }
}
