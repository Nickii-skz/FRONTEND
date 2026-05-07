/**
 * COMPOSITION ROOT — the ONLY file that imports concrete adapter classes.
 * Everything else depends on interfaces.
 */

// Infrastructure — Mock adapters (swap for HTTP adapters in production)
import { MockProductRepository } from '@infrastructure/mock/MockProductRepository'
import { MockOrderRepository } from '@infrastructure/mock/MockOrderRepository'
import { MockAuthService } from '@infrastructure/mock/MockAuthService'
import { MockPaymentGateway } from '@infrastructure/mock/MockPaymentGateway'
import { MockReceiptPrinter } from '@infrastructure/mock/MockReceiptPrinter'
import { MockCustomerRepository } from '@infrastructure/mock/MockCustomerRepository'
import { MockCacheService } from '@infrastructure/mock/MockCacheService'
import { MockSyncQueue } from '@infrastructure/mock/MockSyncQueue'
import { MockShiftRepository } from '@infrastructure/mock/MockShiftRepository'
import { MockEmailService } from '@infrastructure/mock/MockEmailService'
import { ConsoleAnalyticsService } from '@infrastructure/analytics/ConsoleAnalyticsService'

// Use Cases
import { AuthenticateOperatorUseCase } from '@application/use-cases/auth/AuthenticateOperatorUseCase'
import { SearchProductsUseCase } from '@application/use-cases/product/SearchProductsUseCase'
import { AddProductToOrderUseCase } from '@application/use-cases/order/AddProductToOrderUseCase'
import { UpdateOrderLineUseCase } from '@application/use-cases/order/UpdateOrderLineUseCase'
import { ApplyDiscountUseCase } from '@application/use-cases/order/ApplyDiscountUseCase'
import { HoldOrderUseCase } from '@application/use-cases/order/HoldOrderUseCase'
import { ResumeOrderUseCase } from '@application/use-cases/order/ResumeOrderUseCase'
import { GenerateReceiptUseCase } from '@application/use-cases/payment/GenerateReceiptUseCase'
import { ProcessPaymentUseCase } from '@application/use-cases/payment/ProcessPaymentUseCase'
import { SearchCustomerUseCase } from '@application/use-cases/customer/SearchCustomerUseCase'
import { SyncOfflineQueueUseCase } from '@application/use-cases/sync/SyncOfflineQueueUseCase'

// ─── Instantiate adapters ─────────────────────────────────────────────────────
const productRepo     = new MockProductRepository()
const orderRepo       = new MockOrderRepository()
const authService     = new MockAuthService()
const paymentGateway  = new MockPaymentGateway()
const printer         = new MockReceiptPrinter()
const customerRepo    = new MockCustomerRepository()
const cacheService    = new MockCacheService()
const syncQueue       = new MockSyncQueue()
const shiftRepo       = new MockShiftRepository()
const emailService    = new MockEmailService()
const analytics       = new ConsoleAnalyticsService()

// ─── Instantiate use cases (inject ports) ────────────────────────────────────
const generateReceipt   = new GenerateReceiptUseCase(printer)
const processPayment    = new ProcessPaymentUseCase(orderRepo, paymentGateway, generateReceipt)

export const container = {
  // Auth
  authenticateOperator: new AuthenticateOperatorUseCase(authService),
  // Products
  searchProducts:       new SearchProductsUseCase(productRepo, cacheService),
  // Order
  addProductToOrder:    new AddProductToOrderUseCase(productRepo, orderRepo),
  updateOrderLine:      new UpdateOrderLineUseCase(orderRepo),
  applyDiscount:        new ApplyDiscountUseCase(orderRepo, authService),
  holdOrder:            new HoldOrderUseCase(orderRepo),
  resumeOrder:          new ResumeOrderUseCase(orderRepo),
  // Payment
  processPayment,
  generateReceipt,
  // Customer
  searchCustomer:       new SearchCustomerUseCase(customerRepo),
  // Sync
  syncOfflineQueue:     new SyncOfflineQueueUseCase(syncQueue, orderRepo),
  // Repositories (for direct store access)
  productRepo,
  orderRepo,
  shiftRepo,
  emailService,
  analytics,
}

export type UseCaseContainer = typeof container
