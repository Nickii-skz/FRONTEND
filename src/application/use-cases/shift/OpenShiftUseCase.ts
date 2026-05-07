import { Ok, Err, type Result } from '@domain/Result'
import { DuplicateShiftError, DomainError } from '@domain/errors/DomainError'
import type { Shift } from '@domain/entities/Shift'
import type { IShiftRepository } from '@application/ports/outbound/IShiftRepository'
import type { Money } from '@domain/value-objects/Money'

export interface OpenShiftInput {
  registerId: string
  cashierId: string
  cashierName: string
  openingAmount: Money
}

export class OpenShiftUseCase {
  constructor(private readonly shiftRepo: IShiftRepository) {}

  async execute(input: OpenShiftInput): Promise<Result<Shift, DomainError>> {
    // Check if there's already an active shift for this register
    const activeShift = await this.shiftRepo.findActiveByRegister(input.registerId)
    if (activeShift) {
      return Err(new DuplicateShiftError(input.registerId))
    }

    const shift: Shift = {
      id: crypto.randomUUID(),
      registerId: input.registerId,
      cashierId: input.cashierId,
      cashierName: input.cashierName,
      openingAmount: input.openingAmount,
      openedAt: new Date(),
      status: 'open',
      movements: [],
    }

    await this.shiftRepo.save(shift)
    return Ok(shift)
  }
}
