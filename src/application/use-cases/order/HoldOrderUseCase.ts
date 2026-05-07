import { Ok, Err, type Result } from '@domain/Result'
import { OrderEmptyError, ProductNotFoundError } from '@domain/errors/DomainError'
import { holdOrder, createEmptyOrder, type Order } from '@domain/entities/Order'
import type { IOrderRepository } from '@application/ports/outbound/IOrderRepository'

export interface HoldOrderResult {
  heldOrder: Order
  newActiveOrder: Order
}

export class HoldOrderUseCase {
  constructor(private readonly orderRepo: IOrderRepository) {}

  async execute(
    orderId: string,
    currency: string
  ): Promise<Result<HoldOrderResult, OrderEmptyError | ProductNotFoundError>> {
    const order = await this.orderRepo.findById(orderId)
    if (!order) return Err(new ProductNotFoundError(orderId))
    if (order.lines.length === 0) return Err(new OrderEmptyError())

    const held = holdOrder(order)
    const newActive = createEmptyOrder(currency)

    await this.orderRepo.save(held)
    await this.orderRepo.save(newActive)

    return Ok({ heldOrder: held, newActiveOrder: newActive })
  }
}
