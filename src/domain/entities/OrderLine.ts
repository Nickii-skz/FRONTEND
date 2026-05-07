import { Money } from '../value-objects/Money'
import type { Discount } from '../value-objects/Discount'
import type { Product } from './Product'

export interface OrderLine {
  id: string
  product: Product   // snapshot at time of addition
  quantity: number   // positive integer
  unitPrice: Money
  discounts: Discount[]
  note?: string
}

/**
 * Pure function — calculates the subtotal for a single order line.
 * subtotal = (unitPrice × quantity) − sum(lineDiscounts)
 */
export function calcLineSubtotal(line: OrderLine): Money {
  const gross = line.unitPrice.multiplyByScalar(line.quantity)
  const totalDiscount = line.discounts.reduce(
    (acc, d) => acc.add(d.applyTo(gross)),
    Money.zero(line.unitPrice.currency)
  )
  return gross.subtract(totalDiscount)
}
