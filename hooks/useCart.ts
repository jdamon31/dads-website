'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, ProductWithImages } from '@/types'

interface CartStore {
  items: CartItem[]
  addItem: (product: ProductWithImages) => void
  removeItem: (productId: string) => void
  clearCart: () => void
  itemCount: () => number
  total: () => number
  hasItem: (productId: string) => boolean
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        const already = get().items.some((i) => i.product.id === product.id)
        if (already) return
        set((state) => ({
          items: [...state.items, { product, addedAt: Date.now() }],
        }))
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
        }))
      },

      clearCart: () => set({ items: [] }),

      itemCount: () => get().items.length,

      total: () =>
        get().items.reduce((sum, i) => sum + i.product.price, 0),

      hasItem: (productId) =>
        get().items.some((i) => i.product.id === productId),
    }),
    {
      name: 'dads-store-cart',
    }
  )
)
