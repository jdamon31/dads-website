import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase-server'
import { formatPrice } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function OrdersPage() {
  const supabase = createAdminClient()
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        product:products (title)
      )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Orders</h1>

      {!orders || orders.length === 0 ? (
        <p className="text-gray-400 text-sm">No orders yet.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Buyer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item(s)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fulfillment
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => {
                const titles = (order.order_items ?? [])
                  .map((i: { product: { title: string } }) => i.product?.title)
                  .filter(Boolean)
                  .join(', ')

                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{order.buyer_name}</p>
                      <p className="text-gray-400 text-xs">{order.buyer_email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700 max-w-xs truncate">{titles}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {formatPrice(order.total_cents)}
                    </td>
                    <td className="px-4 py-3 capitalize text-gray-600">
                      {order.fulfillment_type}
                    </td>
                    <td className="px-4 py-3 capitalize text-gray-600">
                      {order.payment_method}
                    </td>
                    <td className="px-4 py-3 capitalize text-gray-600">
                      {order.order_status}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-sm text-gray-500 hover:text-gray-900 underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
