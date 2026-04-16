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
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
      {/* Image */}
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          {firstImage ? (
            <Image
              src={firstImage.url}
              alt={product.title}
              fill
              className={`object-cover group-hover:scale-105 transition-transform duration-500 ${isSold ? 'opacity-50' : ''}`}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
          )}
          {/* Condition badge overlaid on image */}
          {!isSold && (
            <div className="absolute top-2 left-2">
              <ConditionBadge condition={product.condition} />
            </div>
          )}
          {isSold && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Badge variant="sold" className="text-sm px-4 py-1.5 shadow-lg">SOLD</Badge>
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-brand-600 font-medium uppercase tracking-wide mb-1">{product.category}</p>
        <Link
          href={`/products/${product.slug}`}
          className="font-semibold text-gray-900 hover:text-brand-600 line-clamp-2 leading-snug text-sm transition-colors"
        >
          {product.title}
        </Link>

        <div className="flex items-center justify-between gap-2 mt-3">
          <span className="text-xl font-black text-gray-900">
            {formatPrice(product.price)}
          </span>
          <Button
            size="sm"
            disabled={isSold || inCart}
            onClick={() => addItem(product)}
            variant={inCart ? 'secondary' : 'primary'}
          >
            {isSold ? 'Sold' : inCart ? '✓ In Cart' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </div>
  )
}
