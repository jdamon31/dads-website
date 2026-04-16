'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊', exact: true },
  { href: '/admin/listings', label: 'Listings', icon: '🏷️', exact: false },
  { href: '/admin/orders', label: 'Orders', icon: '📦', exact: false },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 shrink-0 bg-gray-900 text-white flex flex-col min-h-screen">
      <div className="px-5 py-6 border-b border-gray-700">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Admin</p>
        <p className="font-bold text-lg">Dad&apos;s Store</p>
      </div>

      <nav className="flex-1 py-4 space-y-0.5 px-2">
        {navItems.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-2 py-4 border-t border-gray-700">
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <span>🚪</span>
          Sign Out
        </button>
      </div>
    </aside>
  )
}
