import { Ok, type Result } from '@domain/Result'
import type { DomainError } from '@domain/errors/DomainError'
import type { Order } from '@domain/entities/Order'
import { calcSubtotal, calcOrderDiscounts, calcTaxableBase, calcTotalTaxes, calcTotal } from '@domain/entities/Order'
import type { Receipt, PaymentEntry } from '@domain/entities/Receipt'
import { Money } from '@domain/value-objects/Money'
import type { IReceiptPrinter } from '@application/ports/outbound/IReceiptPrinter'

export interface GenerateReceiptInput {
  order: Order
  payments: PaymentEntry[]
  change: Money
  cashierName: string
  registerId: string
}

export class GenerateReceiptUseCase {
  constructor(private readonly printer: IReceiptPrinter) {}

  async execute(
    input: GenerateReceiptInput
  ): Promise<Result<Receipt, DomainError>> {
    const { order, payments, change, cashierName, registerId } = input

    const receipt: Receipt = {
      id: crypto.randomUUID(),
      orderNumber: `ORD-${order.id.slice(0, 8).toUpperCase()}`,
      orderId: order.id,
      issuedAt: new Date(),
      cashierName,
      registerId,
      customer: order.customer,
      lines: order.lines,
      subtotal: calcSubtotal(order),
      totalDiscounts: calcOrderDiscounts(order),
      taxableBase: calcTaxableBase(order),
      totalTaxes: calcTotalTaxes(order),
      total: calcTotal(order),
      payments,
      change,
    }

    // Best-effort print — fallback handled by adapter
    try {
      await this.printer.print(receipt)
    } catch (_err) {
      // Printer failure does not block receipt generation
    }

    return Ok(receipt)
  }
}
