'use client'

import { useState } from 'react'
import { OrderStatus } from '@/types'
import { Spinner } from '@/components/ui/Spinner'

const ORDER_STATUSES: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'complete', label: 'Complete' },
  { value: 'cancelled', label: 'Cancelled' },
]

interface Props {
  orderId: string
  currentStatus: OrderStatus
}

export function StatusDropdown({ orderId, currentStatus }: Props) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus)
  const [loading, setLoading] = useState(false)

  async function handleChange(newStatus: OrderStatus) {
    setLoading(true)
    await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_status: newStatus }),
    })
    setStatus(newStatus)
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={status}
        onChange={(e) => handleChange(e.target.value as OrderStatus)}
        disabled={loading}
        className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-gray-900"
      >
        {ORDER_STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      {loading && <Spinner size="sm" />}
    </div>
  )
}
