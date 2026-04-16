'use client'

import { useRef } from 'react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="relative">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0z"
        />
      </svg>
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search listings..."
        className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
      />
    </div>
  )
}
