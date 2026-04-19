import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase-server'
import { generateSlug } from '@/lib/utils'
import { revalidatePath } from 'next/cache'
import { EbayListing } from '@/types'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { listings }: { listings: EbayListing[] } = await req.json()
  if (!listings?.length) return NextResponse.json({ error: 'No listings provided' }, { status: 400 })

  const supabase = createServiceClient()
  let imported = 0
  let skipped = 0

  for (const listing of listings) {
    // Skip if already imported
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('ebay_listing_id', listing.itemId)
      .single()

    if (existing) { skipped++; continue }

    const slug = generateSlug(listing.title)

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        title: listing.title,
        slug,
        description: listing.description,
        price: listing.priceCents,
        purchase_price: null,
        condition: listing.condition,
        category: 'Other',
        status: 'active',
        fulfillment: 'both',
        is_special: false,
        offers_enabled: false,
        quantity: 1,
        ebay_listing_id: listing.itemId,
      })
      .select()
      .single()

    if (error || !product) { skipped++; continue }

    if (listing.imageUrls.length > 0) {
      await supabase.from('product_images').insert(
        listing.imageUrls.map((url, idx) => ({
          product_id: product.id,
          url,
          display_order: idx,
        }))
      )
    }

    imported++
  }

  revalidatePath('/')
  return NextResponse.json({ imported, skipped })
}
