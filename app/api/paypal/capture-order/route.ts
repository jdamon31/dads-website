import { NextRequest, NextResponse } from 'next/server'
import { capturePayPalOrder } from '@/lib/paypal'
import { createAdminClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function POST(req: NextRequest) {
  const {
    paypalOrderId,
    buyerName,
    buyerEmail,
    buyerPhone,
    fulfillmentType,
    shippingAddress,
    productIds,
    totalCents,
  } = await req.json()

  if (!paypalOrderId || !productIds?.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Capture PayPal payment (synchronous confirmation)
  const { status, captureId } = await capturePayPalOrder(paypalOrderId)

  if (status !== 'COMPLETED') {
    return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Prevent duplicate orders
  const { data: existing } = await supabase
    .from('orders')
    .select('id')
    .eq('payment_intent_id', captureId)
    .single()

  if (existing) {
    return NextResponse.json({ orderId: existing.id })
  }

  // Fetch product prices
  const { data: products } = await supabase
    .from('products')
    .select('id, price, slug')
    .in('id', productIds)

  if (!products?.length) {
    return NextResponse.json({ error: 'Products not found' }, { status: 404 })
  }

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      buyer_name: buyerName,
      buyer_email: buyerEmail,
      buyer_phone: buyerPhone ?? null,
      fulfillment_type: fulfillmentType,
      shipping_address: shippingAddress ?? null,
      payment_method: 'paypal',
      payment_intent_id: captureId,
      payment_status: 'paid',
      order_status: 'pending',
      total_cents: totalCents,
    })
    .select()
    .single()

  if (orderError || !order) {
    return NextResponse.json({ error: 'Order creation failed' }, { status: 500 })
  }

  // Create order items (DB trigger marks products sold)
  await supabase.from('order_items').insert(
    products.map((p) => ({
      order_id: order.id,
      product_id: p.id,
      price_at_purchase_cents: p.price,
    }))
  )

  // Revalidate storefront
  for (const p of products) {
    revalidatePath(`/products/${p.slug}`)
  }
  revalidatePath('/')

  return NextResponse.json({ orderId: order.id })
}
