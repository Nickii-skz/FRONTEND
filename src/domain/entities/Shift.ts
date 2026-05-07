import { Money } from '../value-objects/Money'

export type ShiftStatus = 'open' | 'closed'

export interface CashMovement {
  id: string
  type: 'deposit' | 'withdrawal'
  amount: Money
  reason: string
  timestamp: Date
}

export interface Shift {
  id: string
  registerId: string
  cashierId: string
  cashierName: string
  openingAmount: Money
  openedAt: Date
  closedAt?: Date
  status: ShiftStatus
  movements: CashMovement[]
}

export function calcShiftCashBalance(shift: Shift, cashSales: Money): Money {
  const deposits = shift.movements
    .filter((m) => m.type === 'deposit')
    .reduce((acc, m) => acc.add(m.amount), Money.zero(shift.openingAmount.currency))

  const withdrawals = shift.movements
    .filter((m) => m.type === 'withdrawal')
    .reduce((acc, m) => acc.add(m.amount), Money.zero(shift.openingAmount.currency))

  return shift.openingAmount.add(cashSales).add(deposits).subtract(withdrawals)
}
