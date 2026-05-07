import { Ok, Err, type Result } from '@domain/Result'
import { DomainError, SupervisorRequiredError, ShiftNotFoundError } from '@domain/errors/DomainError'
import type { Shift } from '@domain/entities/Shift'
import type { IShiftRepository } from '@application/ports/outbound/IShiftRepository'
import type { IAuthService } from '@application/ports/outbound/IAuthService'
import { Money } from '@domain/value-objects/Money'

export interface CloseShiftInput {
  shiftId: string
  physicalCount: Money
  supervisorPin?: string
  supervisorId?: string
}

export interface CloseShiftOutput {
  shift: Shift
  expectedBalance: Money
  physicalCount: Money
  difference: Money
}

export class CloseShiftUseCase {
  private readonly SUPERVISOR_THRESHOLD_CENTS = 5000 // $50.00

  constructor(
    private readonly shiftRepo: IShiftRepository,
    private readonly authService: IAuthService
  ) {}

  async execute(input: CloseShiftInput): Promise<Result<CloseShiftOutput, DomainError>> {
    const shift = await this.shiftRepo.findById(input.shiftId)
    if (!shift) {
      return Err(new ShiftNotFoundError(input.shiftId))
    }

    // Calculate expected balance (opening amount + deposits - withdrawals)
    const deposits = shift.movements
      .filter(m => m.type === 'deposit')
      .reduce((acc, m) => acc.add(m.amount), shift.openingAmount)
    
    const withdrawals = shift.movements
      .filter(m => m.type === 'withdrawal')
      .reduce((acc, m) => acc.add(m.amount), Money.zero(shift.openingAmount.currency))
    
    const expectedBalance = deposits.subtract(withdrawals)

    // Calculate difference
    const difference = input.physicalCount.subtract(expectedBalance)

    // Check if supervisor authorization is needed
    const diffAmount = Math.abs(difference.amount)
    if (diffAmount > this.SUPERVISOR_THRESHOLD_CENTS) {
      if (!input.supervisorPin || !input.supervisorId) {
        return Err(new SupervisorRequiredError())
      }
      
      const validPin = await this.authService.validatePin(input.supervisorPin, input.supervisorId)
      if (!validPin) {
        return Err(new SupervisorRequiredError())
      }
    }

    // Close the shift
    const closedShift: Shift = {
      ...shift,
      status: 'closed',
      closedAt: new Date(),
    }

    await this.shiftRepo.save(closedShift)

    return Ok({
      shift: closedShift,
      expectedBalance,
      physicalCount: input.physicalCount,
      difference,
    })
  }
}
