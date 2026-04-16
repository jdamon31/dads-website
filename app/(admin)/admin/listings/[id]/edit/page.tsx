import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase-server'
import { ProductWithImages } from '@/types'
import { ListingForm } from '@/components/admin/ListingForm'

interface Props {
  params: { id: string }
}

async function getProduct(id: string): Promise<ProductWithImages | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, images:product_images(*)')
    .eq('id', id)
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

export default async function EditListingPage({ params }: Props) {
  const product = await getProduct(params.id)
  if (!product) notFound()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Edit Listing</h1>
      <ListingForm product={product} />
    </div>
  )
}
