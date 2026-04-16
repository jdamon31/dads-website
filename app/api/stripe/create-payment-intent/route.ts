import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const { totalCents, cartItems } = await req.json()

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
