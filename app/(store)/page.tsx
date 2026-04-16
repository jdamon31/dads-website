import { createClient } from '@/lib/supabase-server'
import { ProductWithImages } from '@/types'
import { ProductGrid } from '@/components/store/ProductGrid'

export const revalidate = 60

async function getProducts(): Promise<ProductWithImages[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, images:product_images(*)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch products:', error)
    return []
  }

  return (data ?? []).map((p) => ({
    ...p,
    images: (p.images ?? []).sort(
      (a: { display_order: number }, b: { display_order: number }) =>
        a.display_order - b.display_order
    ),
  }))
}

export default async function HomePage() {
  const products = await getProducts()

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Browse Listings</h1>
        <p className="text-gray-500 mt-1">
          Quality auction finds — ships or local pickup available
        </p>
      </div>
      <ProductGrid products={products} />
    </div>
  )
}
