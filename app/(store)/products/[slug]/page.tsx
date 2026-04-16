import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { ProductWithImages } from '@/types'
import { formatPrice } from '@/lib/utils'
import { ImageGallery } from '@/components/store/ImageGallery'
import { ConditionBadge } from '@/components/store/ConditionBadge'
import { FulfillmentBadge } from '@/components/store/FulfillmentBadge'
import { Badge } from '@/components/ui/Badge'
import { AddToCartButton } from './AddToCartButton'

export const revalidate = 60

interface Props {
  params: { slug: string }
}

async function getProduct(slug: string): Promise<ProductWithImages | null> {
  const supabase = createClient()
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
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Images */}
        <ImageGallery images={product.images} title={product.title} />

        {/* Details */}
        <div className="space-y-5">
          <div>
            <div className="flex items-start gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900 flex-1">
                {product.title}
              </h1>
              {isSold && <Badge variant="sold">SOLD</Badge>}
            </div>
            <p className="text-sm text-gray-400 mt-1">{product.category}</p>
          </div>

          <p className="text-3xl font-bold text-gray-900">
            {formatPrice(product.price)}
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <ConditionBadge condition={product.condition} />
            <FulfillmentBadge fulfillment={product.fulfillment} />
          </div>

          {product.description && (
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-1">Description</h2>
              <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          <AddToCartButton product={product} isSold={isSold} />
        </div>
      </div>
    </div>
  )
}
