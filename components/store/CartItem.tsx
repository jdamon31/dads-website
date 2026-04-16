'use client'

import Image from 'next/image'
import { CartItem as CartItemType } from '@/types'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

export function CartItem({ item }: { item: CartItemType }) {
  const removeItem = useCart((s) => s.removeItem)
  const firstImage = item.product.images[0]

  return (
    <div className="flex gap-3 py-3">
      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
        {firstImage ? (
          <Image
            src={firstImage.url}
            alt={item.product.title}
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
            No img
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{item.product.title}</p>
        <p className="text-sm text-gray-500">{formatPrice(item.product.price)}</p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => removeItem(item.product.id)}
        aria-label="Remove item"
        className="shrink-0 text-gray-400 hover:text-red-500"
      >
        ✕
      </Button>
    </div>
  )
}
