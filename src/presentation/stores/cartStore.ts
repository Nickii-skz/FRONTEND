import { create } from 'zustand'
import type { Order } from '@domain/entities/Order'
import type { Receipt } from '@domain/entities/Receipt'

interface CartState {
  activeOrder: Order | null
  heldOrders: Order[]
  lastReceipt: Receipt | null
  setActiveOrder: (order: Order) => void
  setHeldOrders: (orders: Order[]) => void
  addHeldOrder: (order: Order) => void
  removeHeldOrder: (orderId: string) => void
  setLastReceipt: (receipt: Receipt | null) => void
  clearCart: () => void
}

export const useCartStore = create<CartState>((set) => ({
  activeOrder: null,
  heldOrders: [],
  lastReceipt: null,

  setActiveOrder: (order) => set({ activeOrder: order }),

  setHeldOrders: (orders) => set({ heldOrders: orders }),

  addHeldOrder: (order) =>
    set((state) => ({ heldOrders: [...state.heldOrders, order] })),

  removeHeldOrder: (orderId) =>
    set((state) => ({
      heldOrders: state.heldOrders.filter((o) => o.id !== orderId),
    })),

  setLastReceipt: (receipt) => set({ lastReceipt: receipt }),

  clearCart: () => set({ activeOrder: null, lastReceipt: null }),
}))
