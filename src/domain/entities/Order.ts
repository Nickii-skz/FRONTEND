import { Money } from '../value-objects/Money'
import type { Discount } from '../value-objects/Discount'
import type { Tax } from '../value-objects/Tax'
import type { Customer } from './Customer'
import type { OrderLine } from './OrderLine'
import { calcLineSubtotal } from './OrderLine'

export type OrderStatus = 'active' | 'held' | 'completed' | 'voided'

export interface Order {
  id: string
  lines: OrderLine[]
  status: OrderStatus
  customer?: Customer
  discounts: Discount[]   // order-level discounts
  taxes: Tax[]
  createdAt: Date
  updatedAt: Date
  currency: string
}

// ─── Pure calculation functions ───────────────────────────────────────────────

/** Sum of all line subtotals (after line-level discounts) */
export function calcSubtotal(order: Order): Money {
  return order.lines.reduce(
    (acc, line) => acc.add(calcLineSubtotal(line)),
    Money.zero(order.currency)
  )
}

/** Sum of all order-level discount amounts applied to the subtotal */
export function calcOrderDiscounts(order: Order): Money {
  const subtotal = calcSubtotal(order)
  return order.discounts.reduce(
    (acc, d) => acc.add(d.applyTo(subtotal)),
    Money.zero(order.currency)
  )
}

/** Subtotal minus order-level discounts — the base for tax calculation */
export function calcTaxableBase(order: Order): Money {
  const subtotal = calcSubtotal(order)
  const discounts = calcOrderDiscounts(order)
  return subtotal.subtract(discounts)
}

/** Sum of all tax amounts applied to the taxable base */
export function calcTotalTaxes(order: Order): Money {
  const base = calcTaxableBase(order)
  return order.taxes.reduce(
    (acc, t) => acc.add(t.applyTo(base)),
    Money.zero(order.currency)
  )
}

/** Final total: taxableBase + taxes */
export function calcTotal(order: Order): Money {
  return calcTaxableBase(order).add(calcTotalTaxes(order))
}

// ─── Mutation helpers (return new Order, never mutate) ────────────────────────

export function addLineToOrder(order: Order, line: OrderLine): Order {
  const existingIndex = order.lines.findIndex(
    (l) => l.product.sku.equals(line.product.sku)
  )
  if (existingIndex >= 0) {
    // Increment quantity of existing line
    const updated = order.lines.map((l, i) =>
      i === existingIndex ? { ...l, quantity: l.quantity + line.quantity } : l
    )
    return { ...order, lines: updated, updatedAt: new Date() }
  }
  return { ...order, lines: [...order.lines, line], updatedAt: new Date() }
}

export function updateLineQuantity(
  order: Order,
  lineId: string,
  quantity: number
): Order {
  if (quantity <= 0) {
    // Remove the line
    return {
      ...order,
      lines: order.lines.filter((l) => l.id !== lineId),
      updatedAt: new Date(),
    }
  }
  return {
    ...order,
    lines: order.lines.map((l) =>
      l.id === lineId ? { ...l, quantity } : l
    ),
    updatedAt: new Date(),
  }
}

export function applyOrderDiscount(order: Order, discount: Discount): Order {
  return {
    ...order,
    discounts: [...order.discounts, discount],
    updatedAt: new Date(),
  }
}

export function removeOrderDiscount(order: Order, discountId: string): Order {
  return {
    ...order,
    discounts: order.discounts.filter((d) => d.id !== discountId),
    updatedAt: new Date(),
  }
}

export function setOrderCustomer(order: Order, customer: Customer): Order {
  return { ...order, customer, updatedAt: new Date() }
}

export function removeOrderCustomer(order: Order): Order {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { customer: _customer, ...rest } = order
  return { ...rest, updatedAt: new Date() }
}

export function holdOrder(order: Order): Order {
  return { ...order, status: 'held', updatedAt: new Date() }
}

export function resumeOrder(order: Order): Order {
  return { ...order, status: 'active', updatedAt: new Date() }
}

export function completeOrder(order: Order): Order {
  return { ...order, status: 'completed', updatedAt: new Date() }
}

export function voidOrder(order: Order): Order {
  return { ...order, status: 'voided', updatedAt: new Date() }
}

export function createEmptyOrder(currency: string): Order {
  return {
    id: crypto.randomUUID(),
    lines: [],
    status: 'active',
    discounts: [],
    taxes: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    currency,
  }
}
