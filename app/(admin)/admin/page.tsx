import { createAdminClient } from '@/lib/supabase-server'
import { StatsCard } from '@/components/admin/StatsCard'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function getStats() {
  const supabase = createAdminClient()

  const [activeRes, soldRes, ordersRes, recentRes] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'sold'),
    supabase.from('orders').select('id, total_cents', { count: 'exact' }),
    supabase
      .from('orders')
      .select('id, created_at, buyer_name, total_cents, order_status')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const totalRevenue = (ordersRes.data ?? []).reduce(
    (sum: number, o: { total_cents: number }) => sum + o.total_cents,
    0
  )

  return {
    activeListings: activeRes.count ?? 0,
    soldListings: soldRes.count ?? 0,
    totalOrders: ordersRes.count ?? 0,
    totalRevenue,
    recentOrders: recentRes.data ?? [],
  }
}

export default async function AdminDashboardPage() {
  const stats = await getStats()

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Active Listings" value={stats.activeListings} icon="🏷️" />
        <StatsCard label="Items Sold" value={stats.soldListings} icon="✅" />
        <StatsCard label="Total Orders" value={stats.totalOrders} icon="📦" />
        <StatsCard label="Total Revenue" value={formatPrice(stats.totalRevenue)} icon="💰" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-gray-500 hover:text-gray-900">
            View all →
          </Link>
        </div>

        {stats.recentOrders.length === 0 ? (
          <p className="text-sm text-gray-400">No orders yet.</p>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Buyer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.recentOrders.map((order: {
                  id: string
                  buyer_name: string
                  total_cents: number
                  order_status: string
                  created_at: string
                }) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{order.buyer_name}</td>
                    <td className="px-4 py-3 text-gray-700">{formatPrice(order.total_cents)}</td>
                    <td className="px-4 py-3 capitalize text-gray-700">{order.order_status}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
