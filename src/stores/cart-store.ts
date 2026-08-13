import { useSyncExternalStore } from "react"
import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CartLine {
  fragranceId: string
  offeringId: string
  fragranceName: string
  brandName: string
  sizeMl: number
  price: number
  quantity: number
  heroImageUrl?: string
}

interface CartState {
  lines: CartLine[]
  addLine: (line: Omit<CartLine, "quantity">, quantity?: number) => void
  updateQuantity: (offeringId: string, quantity: number) => void
  removeLine: (offeringId: string) => void
  clear: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      addLine: (line, quantity = 1) =>
        set((state) => {
          const existing = state.lines.find((entry) => entry.offeringId === line.offeringId)

          if (existing) {
            return {
              lines: state.lines.map((entry) =>
                entry.offeringId === line.offeringId ? { ...entry, quantity: entry.quantity + quantity } : entry
              ),
            }
          }

          return { lines: [...state.lines, { ...line, quantity }] }
        }),
      updateQuantity: (offeringId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return { lines: state.lines.filter((entry) => entry.offeringId !== offeringId) }
          }

          return {
            lines: state.lines.map((entry) => (entry.offeringId === offeringId ? { ...entry, quantity } : entry)),
          }
        }),
      removeLine: (offeringId) => set((state) => ({ lines: state.lines.filter((entry) => entry.offeringId !== offeringId) })),
      clear: () => set({ lines: [] }),
    }),
    { name: "whiffs-cart-v1" }
  )
)

export function cartSubtotal(lines: CartLine[]) {
  return lines.reduce((sum, line) => sum + line.price * line.quantity, 0)
}

export function cartQuantity(lines: CartLine[]) {
  return lines.reduce((sum, line) => sum + line.quantity, 0)
}

// localStorage isn't available during SSR, so the store starts empty on both server and first
// client render, then rehydrates -- this tracks that so pages can wait before redirecting an
// empty-looking-but-not-yet-hydrated cart away.
export function useCartHydrated() {
  return useSyncExternalStore(
    (callback) => useCartStore.persist.onFinishHydration(callback),
    () => useCartStore.persist.hasHydrated(),
    () => false
  )
}
