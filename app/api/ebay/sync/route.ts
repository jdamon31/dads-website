import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase-server'
import { fetchActiveListings } from '@/lib/ebay'

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!process.env.EBAY_APP_ID || !process.env.EBAY_USER_TOKEN) {
    return NextResponse.json({ error: 'eBay credentials not configured' }, { status: 503 })
  }

  const supabase = createServiceClient()

  // Fetch active listings from eBay
  const listings = await fetchActiveListings()
  const activeItemIds = new Set(listings.map((l) => l.itemId))

  // Find previously-imported products that are no longer active on eBay → mark sold
  const { data: imported } = await supabase
    .from('products')
    .select('id, ebay_listing_id')
    .not('ebay_listing_id', 'is', null)
    .eq('status', 'active')

  let markedSold = 0
  if (imported?.length) {
    const toMarkSold = imported
      .filter((p) => p.ebay_listing_id && !activeItemIds.has(p.ebay_listing_id))
      .map((p) => p.id)

    if (toMarkSold.length) {
      await supabase
        .from('products')
        .update({ status: 'sold' })
        .in('id', toMarkSold)
      markedSold = toMarkSold.length
    }
  }

  // Get already-imported IDs so the UI can show "Already imported" badges
  const { data: existing } = await supabase
    .from('products')
    .select('ebay_listing_id')
    .not('ebay_listing_id', 'is', null)

  const existingIds = new Set((existing ?? []).map((p) => p.ebay_listing_id))

  return NextResponse.json({ listings, existingIds: [...existingIds], markedSold })
}
