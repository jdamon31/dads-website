import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const {
    totalCents,
    cartItems,
    paymentIntentId,
    buyerName,
    buyerEmail,
    buyerPhone,
    fulfillmentType,
    shippingAddress,
    pickupNotes,
    shippingCents,
  } = await req.json()

  // Update existing PI with buyer metadata + final amount (called before card confirmation)
  if (paymentIntentId) {
    const existing = await stripe.paymentIntents.retrieve(paymentIntentId)
    const cartItemIds = existing.metadata?.cartItemIds ?? '[]'
    const itemsCents: number = existing.metadata?.itemsCents
      ? Number(existing.metadata.itemsCents)
      : existing.amount
    const newAmount = itemsCents + (shippingCents ?? 0)

    const updated = await stripe.paymentIntents.update(paymentIntentId, {
      amount: newAmount,
      metadata: {
        cartItemIds,
        itemsCents: String(itemsCents),
        buyerName: buyerName ?? '',
        buyerEmail: buyerEmail ?? '',
        buyerPhone: buyerPhone ?? '',
        fulfillmentType: fulfillmentType ?? 'ship',
        shippingAddress: shippingAddress ?? '',
        pickupNotes: pickupNotes ?? '',
        shippingCents: String(shippingCents ?? 0),
      },
    })
    return NextResponse.json({ clientSecret: updated.client_secret })
  }

  // Create new PI (initial load)
  if (!totalCents || totalCents < 50) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
  }

  const cartItemIds = JSON.stringify(
    (cartItems ?? []).map((item: { product: { id: string } }) => item.product.id)
  )

  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalCents,
    currency: 'usd',
    automatic_payment_methods: { enabled: true },
    metadata: {
      cartItemIds,
      itemsCents: String(totalCents),
    },
  })

  return NextResponse.json({ clientSecret: paymentIntent.client_secret })
}
