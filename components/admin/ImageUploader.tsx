'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Spinner } from '@/components/ui/Spinner'

interface ImageUploaderProps {
  urls: string[]
  onChange: (urls: string[]) => void
}

export function ImageUploader({ urls, onChange }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    setError(null)

    const formData = new FormData()
    Array.from(files).forEach((file) => formData.append('files', file))

    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Upload failed')
    } else {
      onChange([...urls, ...data.urls])
    }
    setUploading(false)
  }

  function removeImage(idx: number) {
    onChange(urls.filter((_, i) => i !== idx))
  }

  function moveImage(from: number, to: number) {
    const next = [...urls]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    onChange(next)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {urls.map((url, idx) => (
          <div key={url} className="relative w-24 h-24 rounded-lg overflow-hidden group border border-gray-200">
            <Image src={url} alt={`Photo ${idx + 1}`} fill className="object-cover" sizes="96px" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
              {idx > 0 && (
                <button
                  type="button"
                  onClick={() => moveImage(idx, idx - 1)}
                  className="text-white text-xs bg-black/50 rounded px-1 py-0.5"
                  title="Move left"
                >
                  ←
                </button>
              )}
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="text-white text-xs bg-red-600 rounded px-1 py-0.5"
                title="Remove"
              >
                ✕
              </button>
              {idx < urls.length - 1 && (
                <button
                  type="button"
                  onClick={() => moveImage(idx, idx + 1)}
                  className="text-white text-xs bg-black/50 rounded px-1 py-0.5"
                  title="Move right"
                >
                  →
                </button>
              )}
            </div>
            {idx === 0 && (
              <span className="absolute bottom-0 left-0 right-0 text-center text-white text-[10px] bg-black/50 py-0.5">
                Main
              </span>
            )}
          </div>
        ))}

        {/* Upload button */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <Spinner size="sm" />
          ) : (
            <>
              <span className="text-2xl">+</span>
              <span className="text-xs">Add photo</span>
            </>
          )}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && <p className="text-xs text-red-600">{error}</p>}
      <p className="text-xs text-gray-400">
        First photo is the main listing image. Use ← → to reorder.
      </p>
    </div>
  )
}
