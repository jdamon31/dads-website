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
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
