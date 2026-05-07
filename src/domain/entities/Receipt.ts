import type { Money } from '../value-objects/Money'
import type { OrderLine } from './OrderLine'
import type { Customer } from './Customer'

export type PaymentMethodType = 'cash' | 'debit' | 'credit' | 'transfer' | 'qr'

export interface PaymentEntry {
  method: PaymentMethodType
  amount: Money
}

export interface Receipt {
  id: string
  orderNumber: string
  orderId: string
  issuedAt: Date
  cashierName: string
  registerId: string
  customer?: Customer
  lines: OrderLine[]
  subtotal: Money
  totalDiscounts: Money
  taxableBase: Money
  totalTaxes: Money
  total: Money
  payments: PaymentEntry[]
  change: Money
}
