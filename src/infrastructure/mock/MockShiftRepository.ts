import type { IShiftRepository } from '@application/ports/outbound/IShiftRepository'
import type { Shift } from '@domain/entities/Shift'

export class MockShiftRepository implements IShiftRepository {
  private store = new Map<string, Shift>()

  async save(shift: Shift): Promise<void> {
    this.store.set(shift.id, { ...shift })
  }

  async findById(id: string): Promise<Shift | null> {
    return this.store.get(id) ?? null
  }

  async findActiveByRegister(registerId: string): Promise<Shift | null> {
    for (const shift of this.store.values()) {
      if (shift.registerId === registerId && shift.status === 'open') return shift
    }
    return null
  }

  async close(shiftId: string, closedAt: Date): Promise<void> {
    const shift = this.store.get(shiftId)
    if (shift) this.store.set(shiftId, { ...shift, status: 'closed', closedAt })
  }
}
