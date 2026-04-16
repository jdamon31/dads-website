'use client'

import { useState, useMemo } from 'react'
import { ProductWithImages } from '@/types'
import { ProductCard } from './ProductCard'
import { SearchBar } from './SearchBar'
import { CategoryTabs } from './CategoryTabs'

interface ProductGridProps {
  products: ProductWithImages[]
}

export function ProductGrid({ products }: ProductGridProps) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = category === 'All' || p.category === category
      const matchesSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [products, search, category])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="sm:w-64">
          <SearchBar value={search} onChange={setSearch} />
        </div>
        <div className="flex-1 overflow-hidden">
          <CategoryTabs active={category} onChange={setCategory} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">No items found</p>
          <p className="text-sm mt-1">Try a different search or category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
