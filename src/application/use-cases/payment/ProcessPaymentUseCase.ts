import { Err, type Result } from '@domain/Result'
import {
  InsufficientFundsError,
  OrderEmptyError,
  ProductNotFoundError,
  DomainError,
} from '@domain/errors/DomainError'
import { calcTotal, completeOrder } from '@domain/entities/Order'
import { Money } from '@domain/value-objects/Money'
import type { Receipt, PaymentEntry } from '@domain/entities/Receipt'
import type { IOrderRepository } from '@application/ports/outbound/IOrderRepository'
import type { IPaymentGateway } from '@application/ports/outbound/IPaymentGateway'
import type { GenerateReceiptUseCase } from './GenerateReceiptUseCase'

class PaymentGatewayError extends DomainError {
  readonly code = 'PAYMENT_GATEWAY_ERROR'
  constructor(message: string) {
    super(message)
  }
}

export interface ProcessPaymentInput {
  orderId: string
  payments: PaymentEntry[]
  cashierName: string
  registerId: string
}

export class ProcessPaymentUseCase {
  constructor(
    private readonly orderRepo: IOrderRepository,
    private readonly paymentGateway: IPaymentGateway,
    private readonly generateReceipt: GenerateReceiptUseCase
  ) {}

  async execute(
    input: ProcessPaymentInput
  ): Promise<Result<Receipt, DomainError>> {
    const order = await this.orderRepo.findById(input.orderId)
    if (!order) return Err(new ProductNotFoundError(input.orderId))
    if (order.lines.length === 0) return Err(new OrderEmptyError())

    const total = calcTotal(order)
    const currency = total.currency

    // Validate total coverage
    const paidTotal = input.payments.reduce(
      (acc, p) => acc.add(p.amount),
      Money.zero(currency)
    )
    if (!paidTotal.isGreaterThanOrEqual(total)) {
      return Err(new InsufficientFundsError())
    }

    // Process non-cash payments through gateway
    const nonCash = input.payments.filter((p) => p.method !== 'cash')
    if (nonCash.length > 0) {
      try {
        await this.paymentGateway.processPayment({
          orderId: order.id,
          payments: nonCash,
          total,
        })
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        return Err(new PaymentGatewayError(msg))
      }
    }

    const completed = completeOrder(order)
    await this.orderRepo.save(completed)

    const change = paidTotal.subtract(total)
    return this.generateReceipt.execute({
      order: completed,
      payments: input.payments,
      change,
      cashierName: input.cashierName,
      registerId: input.registerId,
    })
  }
}
