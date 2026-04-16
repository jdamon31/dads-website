import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase-server'

interface Params {
  params: { id: string }
}

// GET /api/orders/[id] — admin only
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        product:products (id, title, slug, price)
      )
    `)
    .eq('id', params.id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}

// PATCH /api/orders/[id] — admin only, update order_status
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { order_status } = await req.json()
  if (!order_status) {
    return NextResponse.json({ error: 'Missing order_status' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('orders')
    .update({ order_status })
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
