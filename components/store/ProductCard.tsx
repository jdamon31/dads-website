'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ProductWithImages } from '@/types'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/hooks/useCart'
import { ConditionBadge } from './ConditionBadge'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export function ProductCard({ product }: { product: ProductWithImages }) {
  const { addItem, hasItem } = useCart()
  const firstImage = product.images[0]
  const isSold = product.status === 'sold'
  const inCart = hasItem(product.id)

  return (
    <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Image */}
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          {firstImage ? (
            <Image
              src={firstImage.url}
              alt={product.title}
              fill
              className={`object-cover group-hover:scale-105 transition-transform duration-300 ${isSold ? 'opacity-60' : ''}`}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
              No image
            </div>
          )}
          {isSold && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Badge variant="sold" className="text-sm px-3 py-1">SOLD</Badge>
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-4 space-y-3">
        <div>
          <Link
            href={`/products/${product.slug}`}
            className="font-medium text-gray-900 hover:text-gray-600 line-clamp-2 leading-snug"
          >
            {product.title}
          </Link>
          <p className="text-xs text-gray-400 mt-1">{product.category}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <ConditionBadge condition={product.condition} />
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          <Button
            size="sm"
            disabled={isSold || inCart}
            onClick={() => addItem(product)}
            variant={inCart ? 'secondary' : 'primary'}
          >
            {isSold ? 'Sold' : inCart ? 'In Cart' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </div>
  )
}
