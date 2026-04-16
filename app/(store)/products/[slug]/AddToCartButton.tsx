'use client'

import { useCart } from '@/hooks/useCart'
import { Button } from '@/components/ui/Button'
import { ProductWithImages } from '@/types'
import Link from 'next/link'

interface Props {
  product: ProductWithImages
  isSold: boolean
}

export function AddToCartButton({ product, isSold }: Props) {
  const { addItem, hasItem } = useCart()
  const inCart = hasItem(product.id)

  if (isSold) {
    return (
      <Button size="lg" disabled className="w-full">
        Sold — No Longer Available
      </Button>
    )
  }

  if (inCart) {
    return (
      <div className="space-y-2">
        <Button size="lg" variant="secondary" disabled className="w-full">
          ✓ Added to Cart
        </Button>
        <Link href="/checkout" className="block">
          <Button size="lg" className="w-full">
            Proceed to Checkout →
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <Button size="lg" className="w-full" onClick={() => addItem(product)}>
      Add to Cart
    </Button>
  )
}
