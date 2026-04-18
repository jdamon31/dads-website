'use client'

import { Category } from '@/types'
import { cn } from '@/lib/utils'

interface CategoryTabsProps {
  active: string
  onChange: (category: string) => void
  categories: Category[]
}

export function CategoryTabs({ active, onChange, categories }: CategoryTabsProps) {
  const all = [{ id: 'all', name: 'All' }, ...categories]

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {all.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.name)}
          className={cn(
            'shrink-0 px-4 py-2.5 rounded-full text-sm font-medium transition-colors',
            active === cat.name
              ? 'bg-brand-600 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-400 hover:text-brand-600'
          )}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )
}
