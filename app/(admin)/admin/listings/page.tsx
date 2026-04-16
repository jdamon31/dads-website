import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase-server'
import { formatPrice } from '@/lib/utils'
import { ProductWithImages } from '@/types'
import { Button } from '@/components/ui/Button'
import { ConditionBadge } from '@/components/store/ConditionBadge'
import { ListingActions } from './ListingActions'

export const dynamic = 'force-dynamic'

async function getProducts(): Promise<ProductWithImages[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('products')
    .select('*, images:product_images(*)')
    .order('created_at', { ascending: false })

  return (data ?? []).map((p) => ({
    ...p,
    images: (p.images ?? []).sort(
      (a: { display_order: number }, b: { display_order: number }) =>
        a.display_order - b.display_order
    ),
  }))
}

export default async function ListingsPage() {
  const products = await getProducts()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Listings</h1>
        <Link href="/admin/listings/new">
          <Button>+ New Listing</Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">No listings yet</p>
          <p className="text-sm mt-1">
            <Link href="/admin/listings/new" className="text-gray-900 underline">
              Create your first listing
            </Link>
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                  Photo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Condition
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {product.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.images[0].url}
                        alt={product.title}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100" />
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">
                    {product.title}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{product.category}</td>
                  <td className="px-4 py-3">
                    <ConditionBadge condition={product.condition} />
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-4 py-3 capitalize text-gray-600">{product.status}</td>
                  <td className="px-4 py-3 text-right">
                    <ListingActions product={product} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
