'use client'

import Link from 'next/link'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { CartItem } from './CartItem'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const items = useCart((s) => s.items)
  const total = useCart((s) => s.total)

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-xl z-50 flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Cart ({items.length})
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 divide-y divide-gray-100">
          {items.length === 0 ? (
            <p className="text-center text-gray-400 py-12 text-sm">
              Your cart is empty
            </p>
          ) : (
            items.map((item) => <CartItem key={item.product.id} item={item} />)
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t px-4 py-4 space-y-3">
            <div className="flex items-center justify-between font-semibold text-gray-900">
              <span>Subtotal</span>
              <span>{formatPrice(total())}</span>
            </div>
            <Link href="/checkout" onClick={onClose} className="block">
              <Button className="w-full" size="lg">
                Proceed to Checkout →
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
