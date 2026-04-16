'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ProductImage } from '@/types'

interface ImageGalleryProps {
  images: ProductImage[]
  title: string
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [selected, setSelected] = useState(0)

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
        <span className="text-gray-400 text-sm">No image</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
        <Image
          src={images[selected].url}
          alt={`${title} — photo ${selected + 1}`}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={selected === 0}
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setSelected(idx)}
              className={`relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                idx === selected ? 'border-gray-900' : 'border-transparent hover:border-gray-300'
              }`}
            >
              <Image
                src={img.url}
                alt={`${title} thumbnail ${idx + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
