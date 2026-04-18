import { createServiceClient } from '@/lib/supabase-server'
import { ProductWithImages } from '@/types'
import { ProductGrid } from '@/components/store/ProductGrid'
import { FeaturedSection } from '@/components/store/FeaturedSection'

export const dynamic = 'force-dynamic'

async function getProducts(): Promise<{ specials: ProductWithImages[]; rest: ProductWithImages[] }> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, images:product_images(*)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch products:', error)
    return { specials: [], rest: [] }
  }

  const products: ProductWithImages[] = (data ?? []).map((p) => ({
    ...p,
    images: (p.images ?? []).sort(
      (a: { display_order: number }, b: { display_order: number }) =>
        a.display_order - b.display_order
    ),
  }))

  return {
    specials: products.filter((p) => p.is_special),
    rest: products.filter((p) => !p.is_special),
  }
}

export default async function HomePage() {
  const { specials, rest } = await getProducts()

  return (
    <>
      {/* Hero */}
      <section className="bg-dark-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-10 sm:py-16 md:py-20">
          <div className="max-w-2xl">
            <p className="text-brand-400 font-semibold text-sm uppercase tracking-widest mb-3">
              Handpicked Selection
            </p>
            <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight mb-4">
              Quality Goods at <span className="text-brand-500">Great Prices.</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed">
              Premium tools, electronics, collectibles, and more — carefully selected and ready to ship or pick up locally.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-brand-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
                Ships nationwide
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-brand-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
                Local pickup available
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-brand-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
                Stripe &amp; PayPal accepted
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured specials */}
      <FeaturedSection products={specials} />

      {/* Main catalog */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <ProductGrid products={rest} />
      </div>
    </>
  )
}
