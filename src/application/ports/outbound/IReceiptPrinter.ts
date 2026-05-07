import type { Receipt } from '@domain/entities/Receipt'

export interface IReceiptPrinter {
  print(receipt: Receipt): Promise<void>
  isAvailable(): Promise<boolean>
}
