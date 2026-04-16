'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/lib/utils'
import { Order } from '@/types'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'

export function SuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const clearCart = useCart((s) => s.clearCart)
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    clearCart()
  }, [clearCart])

  useEffect(() => {
    if (!orderId) {
      setLoading(false)
      return
    }
    fetch(`/api/orders/${orderId}`)
      .then((r) => r.json())
      .then((data) => setOrder(data))
      .finally(() => setLoading(false))
  }, [orderId])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-6">
      <div className="text-5xl">🎉</div>
      <h1 className="text-3xl font-bold text-gray-900">Order Confirmed!</h1>

      {order ? (
        <div className="text-left bg-gray-50 rounded-xl p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-500">Confirmation sent to</p>
            <p className="font-medium text-gray-900">{order.buyer_email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total paid</p>
            <p className="font-medium text-gray-900">{formatPrice(order.total_cents)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Fulfillment</p>
            <p className="font-medium text-gray-900 capitalize">
              {order.fulfillment_type === 'ship' ? '📦 Will be shipped' : '📍 Local pickup'}
            </p>
            {order.fulfillment_type === 'ship' && order.shipping_address && (
              <p className="text-sm text-gray-600 mt-1">
                {order.shipping_address.line1}
                {order.shipping_address.line2 && `, ${order.shipping_address.line2}`},{' '}
                {order.shipping_address.city}, {order.shipping_address.state}{' '}
                {order.shipping_address.zip}
              </p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-gray-500">
          Your payment was received. Check your email for confirmation.
        </p>
      )}

      <p className="text-sm text-gray-500">
        You&apos;ll hear from us soon with tracking info or pickup instructions.
      </p>

      <Link href="/">
        <Button size="lg">Continue Browsing</Button>
      </Link>
    </div>
  )
}
