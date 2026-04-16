'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ProductWithImages, ProductStatus } from '@/types'
import { Button } from '@/components/ui/Button'

export function ListingActions({ product }: { product: ProductWithImages }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function toggleStatus() {
    setLoading(true)
    const newStatus: ProductStatus = product.status === 'active' ? 'sold' : 'active'
    await fetch(`/api/products/${product.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    router.refresh()
    setLoading(false)
  }

  async function handleDelete() {
    if (!confirm(`Delete "${product.title}"? This cannot be undone.`)) return
    setLoading(true)
    await fetch(`/api/products/${product.id}`, { method: 'DELETE' })
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        size="sm"
        variant="secondary"
        onClick={toggleStatus}
        disabled={loading}
      >
        {product.status === 'active' ? 'Mark Sold' : 'Mark Active'}
      </Button>
      <Link href={`/admin/listings/${product.id}/edit`}>
        <Button size="sm" variant="ghost">
          Edit
        </Button>
      </Link>
      <Button size="sm" variant="danger" onClick={handleDelete} disabled={loading}>
        Delete
      </Button>
    </div>
  )
}
