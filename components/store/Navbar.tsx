'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useCart } from '@/hooks/useCart'
import { CartDrawer } from './CartDrawer'

export function Navbar() {
  const [cartOpen, setCartOpen] = useState(false)
  const itemCount = useCart((s) => s.itemCount)

  return (
    <>
      <nav className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold text-gray-900 hover:text-gray-700"
          >
            Dad&apos;s Store
          </Link>

          <button
            onClick={() => setCartOpen(true)}
            className="relative p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
            aria-label={`Open cart, ${itemCount()} items`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.836l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
              />
            </svg>
            {itemCount() > 0 && (
              <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                {itemCount()}
              </span>
            )}
          </button>
        </div>
      </nav>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
