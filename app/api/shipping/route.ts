import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { calculateShipping } from '@/lib/shipping'
import { CartItem } from '@/types'

export async function POST(req: NextRequest) {
  const { toZip, items }: { toZip: string; items: CartItem[] } = await req.json()

  if (!toZip || !items?.length) {
    return NextResponse.json({ error: 'Missing zip or items' }, { status: 400 })
  }

  const zip = toZip.trim().slice(0, 5)
  if (!/^\d{5}$/.test(zip)) {
    return NextResponse.json({ error: 'Invalid ZIP code' }, { status: 400 })
  }

  // Fetch shipping dims from DB (cart items only have price/images, not dims)
  const supabase = createServiceClient()
  const productIds = items.map((i) => i.product.id)

  const { data: products } = await supabase
    .from('products')
    .select('id, weight_oz, length_in, width_in, height_in')
    .in('id', productIds)

  if (!products?.length) {
    return NextResponse.json({ error: 'Products not found' }, { status: 404 })
  }

  const shippingItems = products.map((p) => ({
    weight_oz: p.weight_oz ?? null,
    length_in: p.length_in ?? null,
    width_in: p.width_in ?? null,
    height_in: p.height_in ?? null,
  }))

  const result = await calculateShipping(shippingItems, zip)
  return NextResponse.json(result)
}
