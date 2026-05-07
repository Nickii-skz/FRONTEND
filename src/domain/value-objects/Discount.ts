import { Money } from './Money'

export type DiscountType = 'percentage' | 'fixed'
export type DiscountScope = 'line' | 'order'

export interface DiscountProps {
  id: string
  type: DiscountType
  /** percentage: 0–100 | fixed: amount in cents */
  value: number
  scope: DiscountScope
  requiresSupervisor: boolean
  label?: string
}

/**
 * Immutable value object representing a price reduction.
 */
export class Discount {
  readonly id: string
  readonly type: DiscountType
  readonly value: number
  readonly scope: DiscountScope
  readonly requiresSupervisor: boolean
  readonly label: string

  constructor(props: DiscountProps) {
    this.id = props.id
    this.type = props.type
    this.value = props.value
    this.scope = props.scope
    this.requiresSupervisor = props.requiresSupervisor
    this.label = props.label ?? (props.type === 'percentage' ? `${props.value}% off` : `$${(props.value / 100).toFixed(2)} off`)
  }

  /**
   * Apply this discount to a base Money amount.
   * Result is always >= 0.
   */
  applyTo(base: Money): Money {
    if (this.type === 'percentage') {
      // floor(base.amount × value / 100) in cents
      const discountCents = Math.floor((base.amount * this.value) / 100)
      return Money.fromCents(discountCents, base.currency)
    } else {
      // fixed: min(base.amount, value) — never negative
      const discountCents = Math.min(base.amount, this.value)
      return Money.fromCents(discountCents, base.currency)
    }
  }

  equals(other: Discount): boolean {
    return this.id === other.id
  }
}
