import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase-server'
import { ProductWithImages } from '@/types'
import { formatPrice } from '@/lib/utils'
import { ImageGallery } from '@/components/store/ImageGallery'
import { ConditionBadge } from '@/components/store/ConditionBadge'
import { FulfillmentBadge } from '@/components/store/FulfillmentBadge'
import { Badge } from '@/components/ui/Badge'
import { AddToCartButton } from './AddToCartButton'
import { OfferForm } from './OfferForm'

export const revalidate = 60

interface Props {
  params: { slug: string }
}

async function getProduct(slug: string): Promise<ProductWithImages | null> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, images:product_images(*)')
    .eq('slug', slug)
    .single()

  if (error || !data) return null

  return {
    ...data,
    images: (data.images ?? []).sort(
      (a: { display_order: number }, b: { display_order: number }) =>
        a.display_order - b.display_order
    ),
  }
}


export default async function ProductPage({ params }: Props) {
  const product = await getProduct(params.slug)
  if (!product) notFound()

  const isSold = product.status === 'sold'

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back to Shop
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-10">
        {/* Images */}
        <ImageGallery images={product.images} title={product.title} />

        {/* Details */}
        <div className="space-y-5">
          <div>
            <p className="text-sm font-medium text-brand-600 uppercase tracking-wide mb-1">
              {product.category}
            </p>
            <div className="flex items-start gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex-1 leading-tight">
                {product.title}
              </h1>
              {isSold && <Badge variant="sold">SOLD</Badge>}
            </div>
          </div>

          <div className="flex items-baseline gap-4">
            <p className="text-3xl sm:text-4xl font-black text-gray-900">
              {formatPrice(product.price)}
            </p>
            {!isSold && product.quantity === 1 && (
              <span className="text-sm font-semibold text-brand-600">Last one!</span>
            )}
            {!isSold && product.quantity > 1 && (
              <span className="text-sm text-gray-500">{product.quantity} in stock</span>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <ConditionBadge condition={product.condition} />
            <FulfillmentBadge fulfillment={product.fulfillment} />
            {product.is_special && !isSold && (
              <span className="bg-brand-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">⭐ Featured Special</span>
            )}
          </div>

          {product.description && (
            <div className="border-t border-gray-100 pt-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">About this item</h2>
              <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          <div className="pt-2 space-y-3">
            <AddToCartButton product={product} isSold={isSold} />
            {!isSold && product.offers_enabled && (
              <OfferForm productId={product.id} productTitle={product.title} />
            )}
          </div>

          {/* Trust signals */}
          {!isSold && (
            <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <svg className="w-4 h-4 text-brand-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                Questions? Just reach out
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <svg className="w-4 h-4 text-brand-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Secure checkout
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
