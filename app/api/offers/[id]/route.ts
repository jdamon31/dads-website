import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase-server'
import { stripe } from '@/lib/stripe'
import {
  sendOfferAcceptedEmail,
  sendOfferCounteredEmail,
  sendOfferDeclinedEmail,
} from '@/lib/email'
import { formatPrice } from '@/lib/utils'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://dads-website-sandy.vercel.app'

async function createCheckoutSession({
  amountCents,
  productTitle,
  buyerEmail,
  offerId,
  productId,
  productSlug,
  buyerName,
  buyerPhone,
}: {
  amountCents: number
  productTitle: string
  buyerEmail: string
  offerId: string
  productId: string
  productSlug: string
  buyerName: string
  buyerPhone: string | null
}) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: buyerEmail,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: amountCents,
          product_data: { name: productTitle },
        },
        quantity: 1,
      },
    ],
    metadata: {
      offerId,
      productId,
      buyerName,
      buyerEmail,
      buyerPhone: buyerPhone ?? '',
    },
    expires_at: Math.floor(Date.now() / 1000) + 86400, // 24 hours
    success_url: `${APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${APP_URL}/products/${productSlug}`,
  })
  return session
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { action, counter_amount_cents, counter_message } = body
  const supabase = createServiceClient()

  // Fetch offer + product
  const { data: offer } = await supabase
    .from('offers')
    .select('*, product:products(title, slug, id)')
    .eq('id', params.id)
    .single()

  if (!offer) return NextResponse.json({ error: 'Offer not found' }, { status: 404 })

  const product = offer.product as { title: string; slug: string; id: string }

  if (action === 'accept') {
    const checkoutSession = await createCheckoutSession({
      amountCents: offer.offer_amount_cents,
      productTitle: product.title,
      buyerEmail: offer.buyer_email,
      offerId: offer.id,
      productId: product.id,
      productSlug: product.slug,
      buyerName: offer.buyer_name,
      buyerPhone: offer.buyer_phone,
    })

    await supabase
      .from('offers')
      .update({ status: 'accepted', checkout_session_id: checkoutSession.id })
      .eq('id', params.id)

    await sendOfferAcceptedEmail({
      buyerName: offer.buyer_name,
      buyerEmail: offer.buyer_email,
      offerAmount: formatPrice(offer.offer_amount_cents),
      productTitle: product.title,
      paymentUrl: checkoutSession.url!,
    })

    return NextResponse.json({ success: true })
  }

  if (action === 'counter') {
    if (!counter_amount_cents) {
      return NextResponse.json({ error: 'Counter amount required' }, { status: 400 })
    }

    const checkoutSession = await createCheckoutSession({
      amountCents: counter_amount_cents,
      productTitle: product.title,
      buyerEmail: offer.buyer_email,
      offerId: offer.id,
      productId: product.id,
      productSlug: product.slug,
      buyerName: offer.buyer_name,
      buyerPhone: offer.buyer_phone,
    })

    await supabase
      .from('offers')
      .update({
        status: 'countered',
        counter_amount_cents,
        counter_message: counter_message ?? null,
        checkout_session_id: checkoutSession.id,
      })
      .eq('id', params.id)

    await sendOfferCounteredEmail({
      buyerName: offer.buyer_name,
      buyerEmail: offer.buyer_email,
      originalAmount: formatPrice(offer.offer_amount_cents),
      counterAmount: formatPrice(counter_amount_cents),
      counterMessage: counter_message,
      productTitle: product.title,
      paymentUrl: checkoutSession.url!,
    })

    return NextResponse.json({ success: true })
  }

  if (action === 'decline') {
    await supabase.from('offers').update({ status: 'declined' }).eq('id', params.id)

    await sendOfferDeclinedEmail({
      buyerName: offer.buyer_name,
      buyerEmail: offer.buyer_email,
      productTitle: product.title,
    })

    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
