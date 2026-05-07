import type { IPaymentGateway, PaymentRequest, PaymentResult } from '@application/ports/outbound/IPaymentGateway'

export class MockPaymentGateway implements IPaymentGateway {
  private shouldFail = false

  setFailMode(fail: boolean): void {
    this.shouldFail = fail
  }

  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    if (this.shouldFail) {
      throw new Error('Payment gateway unavailable (mock failure)')
    }
    return {
      transactionId: `TXN-${request.orderId.slice(0, 8)}-${Date.now()}`,
      success: true,
      processedAt: new Date(),
    }
  }

  async voidTransaction(_transactionId: string, _reason: string): Promise<void> {
    if (this.shouldFail) throw new Error('Void failed (mock failure)')
  }
}
