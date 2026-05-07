import { create } from 'zustand'
import type { Shift } from '@domain/entities/Shift'

interface ShiftState {
  currentShift: Shift | null
  isOpening: boolean
  isClosing: boolean
  openShift: (shift: Shift) => void
  closeShift: () => void
  setIsOpening: (value: boolean) => void
  setIsClosing: (value: boolean) => void
}

export const useShiftStore = create<ShiftState>((set) => ({
  currentShift: null,
  isOpening: false,
  isClosing: false,

  openShift: (shift) => set({ currentShift: shift, isOpening: false }),

  closeShift: () => set({ currentShift: null, isClosing: false }),

  setIsOpening: (value) => set({ isOpening: value }),

  setIsClosing: (value) => set({ isClosing: value }),
}))
