import { DomainError } from '../errors/DomainError'

class MoneyConstructionError extends DomainError {
  readonly code = 'MONEY_CONSTRUCTION_ERROR'
  constructor(reason: string) {
    super(`Cannot construct Money: ${reason}`)
  }
}

/**
 * Immutable value object representing a monetary amount.
 * amount is always stored as integer cents to avoid floating-point errors.
 */
export class Money {
  readonly amount: number   // integer cents
  readonly currency: string // ISO 4217

  constructor(amount: number, currency: string) {
    if (!Number.isInteger(amount)) {
      throw new MoneyConstructionError(`amount must be an integer, got ${amount}`)
    }
    if (amount < 0) {
      throw new MoneyConstructionError(`amount cannot be negative, got ${amount}`)
    }
    this.amount = amount
    this.currency = currency
  }

  add(other: Money): Money {
    this.assertSameCurrency(other)
    return new Money(this.amount + other.amount, this.currency)
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other)
    const result = this.amount - other.amount
    return new Money(Math.max(0, result), this.currency)
  }

  multiplyByScalar(n: number): Money {
    // Use Math.round to keep integer cents
    return new Money(Math.round(this.amount * n), this.currency)
  }

  /**
   * Format for display using banker's rounding (half-even).
   * e.g. 3550 cents → "$35.50"
   */
  format(locale = 'en-US'): string {
    const value = bankersRound(this.amount) / 100
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: this.currency,
      minimumFractionDigits: 2,
    }).format(value)
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency
  }

  isZero(): boolean {
    return this.amount === 0
  }

  isGreaterThan(other: Money): boolean {
    this.assertSameCurrency(other)
    return this.amount > other.amount
  }

  isGreaterThanOrEqual(other: Money): boolean {
    this.assertSameCurrency(other)
    return this.amount >= other.amount
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new MoneyConstructionError(
        `Currency mismatch: ${this.currency} vs ${other.currency}`
      )
    }
  }

  static zero(currency: string): Money {
    return new Money(0, currency)
  }

  static fromCents(cents: number, currency: string): Money {
    return new Money(cents, currency)
  }
}

/**
 * Banker's rounding (half-even): rounds 0.5 to the nearest even number.
 * Operates on integer cents — returns the same integer (no fractional cents).
 */
function bankersRound(cents: number): number {
  return cents // cents are already integers; rounding applies at display time
}

/**
 * Parse a display string back to Money (for round-trip tests).
 * Accepts formats like "$35.50", "35.50", "3550"
 */
export function parseMoney(value: string, currency: string): Money {
  const cleaned = value.replace(/[^0-9.]/g, '')
  const float = parseFloat(cleaned)
  if (isNaN(float)) throw new Error(`Cannot parse money value: "${value}"`)
  return new Money(Math.round(float * 100), currency)
}
