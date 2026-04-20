'use client'

import { useState } from 'react'
import { formatPrice } from '@/lib/utils'
import { EbayListing } from '@/types'

interface SyncResult {
  listings: EbayListing[]
  existingIds: string[]
  markedSold: number
}

export default function EbaySyncPage() {
  const [syncing, setSyncing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<SyncResult | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSync() {
    setSyncing(true)
    setError(null)
    setResult(null)
    setImportResult(null)
    setSelected(new Set())

    const res = await fetch('/api/ebay/sync', { method: 'POST' })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Sync failed')
      setSyncing(false)
      return
    }

    setResult(data)
    // Pre-select all new (not already imported) listings
    const newIds = data.listings
      .filter((l: EbayListing) => !data.existingIds.includes(l.itemId))
      .map((l: EbayListing) => l.itemId)
    setSelected(new Set(newIds))
    setSyncing(false)
  }

  async function handleImport() {
    if (!result || selected.size === 0) return
    setImporting(true)
    setError(null)

    const toImport = result.listings.filter((l) => selected.has(l.itemId))
    const res = await fetch('/api/ebay/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listings: toImport }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Import failed')
    } else {
      setImportResult(data)
      // Refresh sync result to update "Already imported" badges
      await handleSync()
      return
    }
    setImporting(false)
  }

  function toggleAll(listings: EbayListing[], existingIds: string[]) {
    const newIds = listings.filter((l) => !existingIds.includes(l.itemId)).map((l) => l.itemId)
    if (selected.size === newIds.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(newIds))
    }
  }

  function toggle(itemId: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(itemId)) { next.delete(itemId) } else { next.add(itemId) }
      return next
    })
  }

  const newListings = result?.listings.filter((l) => !result.existingIds.includes(l.itemId)) ?? []
  const allNewSelected = newListings.length > 0 && selected.size === newListings.length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">eBay Sync</h1>
          <p className="text-sm text-gray-500 mt-1">Import your active eBay listings as products</p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing || importing}
          className="bg-brand-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {syncing ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Syncing...
            </>
          ) : '🔄 Sync from eBay'}
        </button>
      </div>

      {/* Unconfigured warning */}
      {error?.includes('not configured') && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-4">
          <p className="text-sm font-semibold text-yellow-800">eBay credentials not set up yet</p>
          <p className="text-sm text-yellow-700 mt-1">Add <code className="bg-yellow-100 px-1 rounded">EBAY_APP_ID</code>, <code className="bg-yellow-100 px-1 rounded">EBAY_DEV_ID</code>, <code className="bg-yellow-100 px-1 rounded">EBAY_CERT_ID</code>, and <code className="bg-yellow-100 px-1 rounded">EBAY_USER_TOKEN</code> to your environment variables.</p>
        </div>
      )}

      {error && !error.includes('not configured') && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Sold notification */}
      {result && result.markedSold > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-3 text-sm text-gray-700">
          {result.markedSold} listing{result.markedSold > 1 ? 's' : ''} no longer active on eBay — marked as sold on the site.
        </div>
      )}

      {/* Import success */}
      {importResult && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-3 text-sm text-green-800 font-medium">
          ✓ {importResult.imported} product{importResult.imported !== 1 ? 's' : ''} imported
          {importResult.skipped > 0 && `, ${importResult.skipped} skipped (already exist)`}
        </div>
      )}

      {/* Listings table */}
      {result && result.listings.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-12">No active eBay listings found.</p>
      )}

      {result && result.listings.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={allNewSelected}
                onChange={() => toggleAll(result.listings, result.existingIds)}
                className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              Select all new ({newListings.length})
            </label>
            {selected.size > 0 && (
              <button
                onClick={handleImport}
                disabled={importing}
                className="bg-gray-900 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {importing ? 'Importing...' : `Import Selected (${selected.size})`}
              </button>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {result.listings.map((listing, i) => {
              const alreadyImported = result.existingIds.includes(listing.itemId)
              const isSelected = selected.has(listing.itemId)

              return (
                <div
                  key={listing.itemId}
                  className={`flex items-center gap-4 p-4 ${i > 0 ? 'border-t border-gray-100' : ''} ${isSelected ? 'bg-brand-50/30' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={alreadyImported}
                    onChange={() => toggle(listing.itemId)}
                    className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 disabled:opacity-40"
                  />

                  {/* Thumbnail */}
                  {listing.imageUrls[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={listing.imageUrls[0]}
                      alt={listing.title}
                      className="w-14 h-14 object-cover rounded-lg shrink-0 bg-gray-100"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-gray-100 shrink-0 flex items-center justify-center text-gray-300 text-xl">📦</div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{listing.title}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-sm font-bold text-gray-900">{formatPrice(listing.priceCents)}</span>
                      <span className="text-xs text-gray-400 capitalize">{listing.condition}</span>
                      <a
                        href={listing.ebayUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-brand-600 hover:underline"
                      >
                        View on eBay →
                      </a>
                    </div>
                  </div>

                  {alreadyImported && (
                    <span className="shrink-0 text-xs font-medium px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full">
                      Already imported
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
