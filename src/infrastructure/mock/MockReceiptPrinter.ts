import type { IReceiptPrinter } from '@application/ports/outbound/IReceiptPrinter'
import type { Receipt } from '@domain/entities/Receipt'

export class MockReceiptPrinter implements IReceiptPrinter {
  readonly printJobs: Receipt[] = []

  async print(receipt: Receipt): Promise<void> {
    this.printJobs.push(receipt)
    console.log('[MockReceiptPrinter] Printed receipt:', receipt.orderNumber)
  }

  async isAvailable(): Promise<boolean> {
    return true
  }
}
