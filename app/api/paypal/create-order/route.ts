import { NextRequest, NextResponse } from 'next/server'
import { createPayPalOrder } from '@/lib/paypal'

export async function POST(req: NextRequest) {
  const { totalCents } = await req.json()

  if (!totalCents || totalCents < 50) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
  }

  const orderId = await createPayPalOrder(totalCents)
  return NextResponse.json({ orderId })
}
