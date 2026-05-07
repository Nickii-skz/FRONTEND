import type { Receipt } from '@domain/entities/Receipt'

export interface IEmailService {
  sendReceipt(receipt: Receipt, emailAddress: string): Promise<void>
}
