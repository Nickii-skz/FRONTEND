import { Money } from './Money'

export interface TaxProps {
  name: string
  rate: number      // percentage 0–100
  inclusive: boolean
}

/**
 * Immutable value object representing a tax rate.
 */
export class Tax {
  readonly name: string
  readonly rate: number
  readonly inclusive: boolean

  constructor(props: TaxProps) {
    this.name = props.name
    this.rate = props.rate
    this.inclusive = props.inclusive
  }

  /**
   * Calculate the tax amount on a given base.
   * For exclusive tax: taxAmount = floor(base × rate / 100)
   * For inclusive tax: taxAmount = floor(base − base / (1 + rate/100))
   */
  applyTo(base: Money): Money {
    if (this.inclusive) {
      const taxCents = Math.floor(base.amount - base.amount / (1 + this.rate / 100))
      return Money.fromCents(taxCents, base.currency)
    } else {
      const taxCents = Math.floor((base.amount * this.rate) / 100)
      return Money.fromCents(taxCents, base.currency)
    }
  }
}
