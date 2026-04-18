'use client'

import { ProductWithImages } from '@/types'
import { ProductCard } from './ProductCard'

export function FeaturedSection({ products }: { products: ProductWithImages[] }) {
  if (products.length === 0) return null

  return (
    <section className="bg-dark-800 py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">⭐</span>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">Featured Deals</h2>
            <p className="text-slate-400 text-sm">Hand-picked specials — limited availability</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
