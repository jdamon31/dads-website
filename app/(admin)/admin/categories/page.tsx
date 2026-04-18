'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Category } from '@/types'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [newName, setNewName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    const res = await fetch('/api/categories')
    const data = await res.json()
    setCategories(data)
  }

  useEffect(() => { load() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setLoading(true)
    setError(null)
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() }),
    })
    if (res.ok) {
      setNewName('')
      await load()
    } else {
      const d = await res.json()
      setError(d.error ?? 'Failed to add category')
    }
    setLoading(false)
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete category "${name}"? Existing listings will keep this category label but it won't appear as a filter option.`)) return
    await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    await load()
  }

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900">Categories</h1>

      {/* Add form */}
      <form onSubmit={handleAdd} className="flex gap-3">
        <div className="flex-1">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Vintage, Power Tools..."
          />
        </div>
        <Button type="submit" disabled={loading || !newName.trim()}>
          Add
        </Button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {categories.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-400 text-center">No categories yet.</p>
        ) : (
          categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm font-medium text-gray-900">{cat.name}</span>
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleDelete(cat.id, cat.name)}
              >
                Delete
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
