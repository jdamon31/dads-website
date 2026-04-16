import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase-server'
import { formatPrice } from '@/lib/utils'
import { StatusDropdown } from '@/components/admin/StatusDropdown'
import { OrderStatus } from '@/types'

export const dynamic = 'force-dynamic'

interface Props {
  params: { id: string }
}

export default async function OrderDetailPage({ params }: Props) {
  const supabase = createAdminClient()
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        product:products (id, title, slug, price)
      )
    `)
    .eq('id', params.id)
    .single()

  if (error || !order) notFound()

  const addr = order.shipping_address

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Order Detail</h1>
        <StatusDropdown orderId={order.id} currentStatus={order.order_status as OrderStatus} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {/* Buyer */}
        <div className="px-5 py-4 space-y-1">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Buyer</p>
          <p className="font-semibold text-gray-900">{order.buyer_name}</p>
          <p className="text-sm text-gray-600">{order.buyer_email}</p>
          {order.buyer_phone && (
            <p className="text-sm text-gray-600">{order.buyer_phone}</p>
          )}
        </div>

        {/* Fulfillment */}
        <div className="px-5 py-4 space-y-1">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Fulfillment</p>
          <p className="font-medium text-gray-900 capitalize">{order.fulfillment_type}</p>
          {order.fulfillment_type === 'ship' && addr && (
            <p className="text-sm text-gray-600">
              {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''},{' '}
              {addr.city}, {addr.state} {addr.zip}
            </p>
          )}
        </div>

        {/* Payment */}
        <div className="px-5 py-4 space-y-1">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Payment</p>
          <p className="font-medium text-gray-900 capitalize">{order.payment_method}</p>
          <p className="text-sm text-gray-500 font-mono">{order.payment_intent_id}</p>
          <p className="text-sm text-gray-600 capitalize">Status: {order.payment_status}</p>
        </div>

        {/* Items */}
        <div className="px-5 py-4 space-y-3">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Items</p>
          {(order.order_items ?? []).map((item: {
            id: string
            price_at_purchase_cents: number
            product: { id: string; title: string }
          }) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-900">{item.product?.title}</span>
              <span className="font-medium text-gray-900">
                {formatPrice(item.price_at_purchase_cents)}
              </span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
            <span>Total</span>
            <span>{formatPrice(order.total_cents)}</span>
          </div>
        </div>

        {/* Date */}
        <div className="px-5 py-4">
          <p className="text-xs text-gray-400">
            Placed on {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  )
}
