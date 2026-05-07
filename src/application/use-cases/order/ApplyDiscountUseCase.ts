import { Ok, Err, type Result } from '@domain/Result'
import {
  InvalidDiscountError,
  SupervisorRequiredError,
  ProductNotFoundError,
} from '@domain/errors/DomainError'
import { applyOrderDiscount, calcTotal, type Order } from '@domain/entities/Order'
import { Discount } from '@domain/value-objects/Discount'
import type { IOrderRepository } from '@application/ports/outbound/IOrderRepository'
import type { IAuthService } from '@application/ports/outbound/IAuthService'

export interface ApplyDiscountInput {
  orderId: string
  discount: Discount
  supervisorPin?: string
  supervisorId?: string
}

export class ApplyDiscountUseCase {
  constructor(
    private readonly orderRepo: IOrderRepository,
    private readonly authService: IAuthService
  ) {}

  async execute(
    input: ApplyDiscountInput
  ): Promise<Result<Order, InvalidDiscountError | SupervisorRequiredError | ProductNotFoundError>> {
    const order = await this.orderRepo.findById(input.orderId)
    if (!order) return Err(new ProductNotFoundError(input.orderId))

    if (input.discount.requiresSupervisor) {
      if (!input.supervisorPin || !input.supervisorId) {
        return Err(new SupervisorRequiredError())
      }
      const valid = await this.authService.validatePin(
        input.supervisorPin,
        input.supervisorId
      )
      if (!valid) return Err(new SupervisorRequiredError())
    }

    const updated = applyOrderDiscount(order, input.discount)

    // Validate post-discount total >= 0 (always true due to Money.subtract clamping, but explicit check)
    const total = calcTotal(updated)
    if (total.amount < 0) {
      return Err(new InvalidDiscountError('Discount would result in a negative total.'))
    }

    await this.orderRepo.save(updated)
    return Ok(updated)
  }
}
