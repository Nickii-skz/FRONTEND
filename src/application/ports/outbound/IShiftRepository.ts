import type { Shift } from '@domain/entities/Shift'

export interface IShiftRepository {
  save(shift: Shift): Promise<void>
  findById(id: string): Promise<Shift | null>
  findActiveByRegister(registerId: string): Promise<Shift | null>
  close(shiftId: string, closedAt: Date): Promise<void>
}
