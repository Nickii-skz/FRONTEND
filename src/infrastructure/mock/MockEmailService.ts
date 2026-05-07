import type { IEmailService } from '@application/ports/outbound/IEmailService'
import type { Receipt } from '@domain/entities/Receipt'

export class MockEmailService implements IEmailService {
  readonly sentEmails: Array<{ receipt: Receipt; to: string }> = []

  async sendReceipt(receipt: Receipt, emailAddress: string): Promise<void> {
    this.sentEmails.push({ receipt, to: emailAddress })
    console.log(`[MockEmailService] Sent receipt ${receipt.orderNumber} to ${emailAddress}`)
  }
}
