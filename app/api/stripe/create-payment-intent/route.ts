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
  } = await req.json()

  // Update existing PI with buyer metadata (called before card confirmation)
  if (paymentIntentId) {
    const updated = await stripe.paymentIntents.update(paymentIntentId, {
      metadata: {
        buyerName: buyerName ?? '',
        buyerEmail: buyerEmail ?? '',
        buyerPhone: buyerPhone ?? '',
        fulfillmentType: fulfillmentType ?? 'ship',
        shippingAddress: shippingAddress ?? '',
        pickupNotes: pickupNotes ?? '',
      },
    })
    return NextResponse.json({ clientSecret: updated.client_secret })
  }

  // Create new PI (initial load)
  if (!totalCents || totalCents < 50) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalCents,
    currency: 'usd',
    automatic_payment_methods: { enabled: true },
    metadata: {
      cartItemIds: JSON.stringify(
        (cartItems ?? []).map((item: { product: { id: string } }) => item.product.id)
      ),
    },
  })

  return NextResponse.json({ clientSecret: paymentIntent.client_secret })
}
