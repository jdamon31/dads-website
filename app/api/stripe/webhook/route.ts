import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = await req.arrayBuffer()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      Buffer.from(body),
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Stripe webhook signature failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type !== 'payment_intent.succeeded') {
    return NextResponse.json({ received: true })
  }

  const paymentIntent = event.data.object as Stripe.PaymentIntent
  const supabase = createAdminClient()

  // Prevent duplicate order creation
  const { data: existing } = await supabase
    .from('orders')
    .select('id')
    .eq('payment_intent_id', paymentIntent.id)
    .single()

  if (existing) {
    return NextResponse.json({ received: true })
  }

  // Extract metadata stored at PaymentIntent creation time
  const meta = paymentIntent.metadata ?? {}
  const productIds: string[] = JSON.parse(meta.cartItemIds ?? '[]')
  const buyerName = meta.buyerName ?? 'Unknown'
  const buyerEmail = meta.buyerEmail ?? ''
  const buyerPhone = meta.buyerPhone ?? null
  const fulfillmentType = (meta.fulfillmentType ?? 'ship') as 'ship' | 'pickup'
  const shippingAddress = meta.shippingAddress ? JSON.parse(meta.shippingAddress) : null

  if (productIds.length === 0) {
    console.error('Stripe webhook: no productIds in metadata for PI', paymentIntent.id)
    return NextResponse.json({ received: true })
  }

  // Fetch current prices from DB
  const { data: products } = await supabase
    .from('products')
    .select('id, price, slug')
    .in('id', productIds)

  if (!products || products.length === 0) {
    console.error('Stripe webhook: products not found for PI', paymentIntent.id)
    return NextResponse.json({ received: true })
  }

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      buyer_name: buyerName,
      buyer_email: buyerEmail,
      buyer_phone: buyerPhone,
      fulfillment_type: fulfillmentType,
      shipping_address: shippingAddress,
      payment_method: 'stripe',
      payment_intent_id: paymentIntent.id,
      payment_status: 'paid',
      order_status: 'pending',
      total_cents: paymentIntent.amount,
    })
    .select()
    .single()

  if (orderError || !order) {
    console.error('Stripe webhook: failed to create order:', orderError)
    return NextResponse.json({ error: 'Order creation failed' }, { status: 500 })
  }

  // Create order items (DB trigger marks products as sold)
  await supabase.from('order_items').insert(
    products.map((p) => ({
      order_id: order.id,
      product_id: p.id,
      price_at_purchase_cents: p.price,
    }))
  )

  // Revalidate product pages so storefront shows "Sold"
  for (const p of products) {
    revalidatePath(`/products/${p.slug}`)
  }
  revalidatePath('/')

  return NextResponse.json({ received: true })
}
