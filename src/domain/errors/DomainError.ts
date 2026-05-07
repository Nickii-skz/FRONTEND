export abstract class DomainError extends Error {
  abstract readonly code: string

  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }
}

export class InsufficientFundsError extends DomainError {
  readonly code = 'INSUFFICIENT_FUNDS'
  constructor() {
    super('Cash received is less than the order total.')
  }
}

export class InvalidDiscountError extends DomainError {
  readonly code = 'INVALID_DISCOUNT'
  constructor(reason: string) {
    super(`Invalid discount: ${reason}`)
  }
}

export class SupervisorRequiredError extends DomainError {
  readonly code = 'SUPERVISOR_REQUIRED'
  constructor() {
    super('This discount requires supervisor authorization.')
  }
}

export class ProductNotFoundError extends DomainError {
  readonly code = 'PRODUCT_NOT_FOUND'
  constructor(sku: string) {
    super(`Product with SKU "${sku}" was not found.`)
  }
}

export class OrderEmptyError extends DomainError {
  readonly code = 'ORDER_EMPTY'
  constructor() {
    super('Cannot checkout an empty order.')
  }
}

export class DuplicateShiftError extends DomainError {
  readonly code = 'DUPLICATE_SHIFT'
  constructor(registerId?: string) {
    super(registerId 
      ? `A shift is already open on register "${registerId}".` 
      : 'A shift is already open on this register.')
  }
}

export class ShiftNotFoundError extends DomainError {
  readonly code = 'SHIFT_NOT_FOUND'
  constructor(shiftId: string) {
    super(`Shift "${shiftId}" was not found.`)
  }
}

export class SessionExpiredError extends DomainError {
  readonly code = 'SESSION_EXPIRED'
  constructor() {
    super('Your session has expired. Please log in again.')
  }
}
