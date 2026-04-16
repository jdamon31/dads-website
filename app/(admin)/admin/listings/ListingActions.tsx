'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ProductWithImages, ProductStatus } from '@/types'
import { Button } from '@/components/ui/Button'

export function ListingActions({ product }: { product: ProductWithImages }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

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

  function copyLink() {
    const url = `${window.location.origin}/products/${product.slug}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {/* Share link */}
      <button
        onClick={copyLink}
        title="Copy shareable link"
        className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
      >
        {copied ? (
          <span className="text-green-600 font-semibold">✓ Copied</span>
        ) : (
          <>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Share
          </>
        )}
      </button>

      {/* View in storefront */}
      <a
        href={`/products/${product.slug}`}
        target="_blank"
        rel="noopener noreferrer"
        title="View in storefront"
        className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
        </svg>
        View
      </a>

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
