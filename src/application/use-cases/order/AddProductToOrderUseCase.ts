import { Ok, Err, type Result } from '@domain/Result'
import { ProductNotFoundError } from '@domain/errors/DomainError'
import { addLineToOrder, createEmptyOrder, type Order } from '@domain/entities/Order'
import type { IProductRepository } from '@application/ports/outbound/IProductRepository'
import type { IOrderRepository } from '@application/ports/outbound/IOrderRepository'
import type { SKU } from '@domain/value-objects/SKU'

export interface AddProductInput {
  sku: SKU
  quantity: number
  currency: string
}

export class AddProductToOrderUseCase {
  constructor(
    private readonly productRepo: IProductRepository,
    private readonly orderRepo: IOrderRepository
  ) {}

  async execute(input: AddProductInput): Promise<Result<Order, ProductNotFoundError>> {
    const product = await this.productRepo.findBySku(input.sku)
    if (!product) {
      return Err(new ProductNotFoundError(input.sku.value))
    }

    let order = await this.orderRepo.findActive()
    if (!order) {
      order = createEmptyOrder(input.currency)
    }

    const newLine = {
      id: crypto.randomUUID(),
      product,
      quantity: input.quantity,
      unitPrice: product.price,
      discounts: [],
    }

    const updatedOrder = addLineToOrder(order, newLine)
    await this.orderRepo.save(updatedOrder)
    return Ok(updatedOrder)
  }
}
