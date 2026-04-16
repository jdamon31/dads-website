'use client'

import { CATEGORIES } from '@/types'
import { cn } from '@/lib/utils'

interface CategoryTabsProps {
  active: string
  onChange: (category: string) => void
}

export function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  const all = ['All', ...CATEGORIES]

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {all.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={cn(
            'shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
            active === cat
              ? 'bg-brand-600 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-400 hover:text-brand-600'
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
