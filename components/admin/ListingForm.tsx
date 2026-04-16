'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { ImageUploader } from './ImageUploader'
import { CATEGORIES, CONDITIONS, ProductWithImages, FulfillmentType, ProductStatus } from '@/types'
import { centsToDollars, dollarsTocents } from '@/lib/utils'

interface Props {
  product?: ProductWithImages
}

export function ListingForm({ product }: Props) {
  const router = useRouter()
  const isEdit = !!product

  const [title, setTitle] = useState(product?.title ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [price, setPrice] = useState(product ? centsToDollars(product.price) : '')
  const [purchasePrice, setPurchasePrice] = useState(
    product?.purchase_price ? centsToDollars(product.purchase_price) : ''
  )
  const [condition, setCondition] = useState(product?.condition ?? 'good')
  const [category, setCategory] = useState(product?.category ?? CATEGORIES[0])
  const [status, setStatus] = useState<ProductStatus>(product?.status ?? 'draft')
  const [fulfillment, setFulfillment] = useState<FulfillmentType>(product?.fulfillment ?? 'both')
  const [imageUrls, setImageUrls] = useState<string[]>(
    product?.images.map((i) => i.url) ?? []
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !price) {
      setError('Title and price are required')
      return
    }

    setLoading(true)
    setError(null)

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      price: dollarsTocents(price),
      purchase_price: purchasePrice ? dollarsTocents(purchasePrice) : null,
      condition,
      category,
      status,
      fulfillment,
      imageUrls,
    }

    const url = isEdit ? `/api/products/${product.id}` : '/api/products'
    const method = isEdit ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Something went wrong')
      setLoading(false)
      return
    }

    router.push('/admin/listings')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Vintage Cast Iron Skillet"
            required
          />
        </div>

        <Input
          label="Sale Price ($)"
          type="number"
          min="0.01"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="45.00"
          required
        />

        <Input
          label="Purchase Price ($)"
          type="number"
          min="0"
          step="0.01"
          value={purchasePrice}
          onChange={(e) => setPurchasePrice(e.target.value)}
          placeholder="12.00"
        />

        <Select
          label="Condition"
          value={condition}
          onChange={(e) => setCondition(e.target.value as typeof condition)}
          options={CONDITIONS.map((c) => ({ value: c.value, label: c.label }))}
        />

        <Select
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={CATEGORIES.map((c) => ({ value: c, label: c }))}
        />

        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as ProductStatus)}
          options={[
            { value: 'draft', label: 'Draft' },
            { value: 'active', label: 'Active' },
            { value: 'sold', label: 'Sold' },
          ]}
        />

        <div className="sm:col-span-2">
          <p className="text-sm font-medium text-gray-700 mb-2">Fulfillment</p>
          <div className="flex gap-3">
            {([
              { value: 'ship', label: '📦 Ships' },
              { value: 'pickup', label: '📍 Local Pickup' },
              { value: 'both', label: '📦📍 Ship or Pickup' },
            ] as { value: FulfillmentType; label: string }[]).map((opt) => (
              <label
                key={opt.value}
                className={`flex-1 border-2 rounded-lg px-3 py-2.5 cursor-pointer text-sm text-center transition-colors ${
                  fulfillment === opt.value
                    ? 'border-gray-900 bg-gray-50 font-medium'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="fulfillment"
                  value={opt.value}
                  checked={fulfillment === opt.value}
                  onChange={() => setFulfillment(opt.value)}
                  className="sr-only"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Describe the item — condition details, size, age, any defects..."
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>

        <div className="sm:col-span-2">
          <p className="text-sm font-medium text-gray-700 mb-2">Photos</p>
          <ImageUploader urls={imageUrls} onChange={setImageUrls} />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Listing'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push('/admin/listings')}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
