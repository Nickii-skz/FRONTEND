import type { PaymentEntry } from '@domain/entities/Receipt'
import type { Money } from '@domain/value-objects/Money'

export interface PaymentRequest {
  orderId: string
  payments: PaymentEntry[]
  total: Money
}

export interface PaymentResult {
  transactionId: string
  success: boolean
  processedAt: Date
}

export interface IPaymentGateway {
  processPayment(request: PaymentRequest): Promise<PaymentResult>
  voidTransaction(transactionId: string, reason: string): Promise<void>
}
