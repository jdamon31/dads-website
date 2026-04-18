import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase-server'
import { sendOfferReceivedEmail } from '@/lib/email'
import { formatPrice } from '@/lib/utils'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('offers')
    .select('*, product:products(title, slug)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const { product_id, buyer_name, buyer_email, buyer_phone, offer_amount_cents, message } = await req.json()

  if (!product_id || !buyer_name?.trim() || !buyer_email?.trim() || !offer_amount_cents) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Verify product exists and has offers enabled
  const { data: product } = await supabase
    .from('products')
    .select('id, title, offers_enabled, status')
    .eq('id', product_id)
    .single()

  if (!product || !product.offers_enabled || product.status !== 'active') {
    return NextResponse.json({ error: 'Offers not available for this item' }, { status: 400 })
  }

  const { error } = await supabase.from('offers').insert({
    product_id,
    buyer_name: buyer_name.trim(),
    buyer_email: buyer_email.trim(),
    buyer_phone: buyer_phone?.trim() || null,
    offer_amount_cents: Math.round(Number(offer_amount_cents)),
    message: message?.trim() || null,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  try {
    await sendOfferReceivedEmail({
      buyerName: buyer_name,
      buyerEmail: buyer_email,
      buyerPhone: buyer_phone,
      offerAmount: formatPrice(offer_amount_cents),
      message,
      productTitle: product.title,
    })
  } catch (err) {
    console.error('Failed to send offer email:', err)
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
