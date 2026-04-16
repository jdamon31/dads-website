import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient, createAdminClient } from '@/lib/supabase-server'
import { generateSlug } from '@/lib/utils'

// GET /api/products — public, returns active products with images
export async function GET() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, images:product_images(*)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}

// POST /api/products — admin only
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { title, description, price, condition, category, status, fulfillment, imageUrls } = body

  if (!title || !price || !condition || !category) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const slug = generateSlug(title)

  // Insert product
  const { data: product, error: productError } = await supabase
    .from('products')
    .insert({
      title,
      slug,
      description: description ?? null,
      price: Math.round(Number(price)),
      condition,
      category,
      status: status ?? 'draft',
      fulfillment: fulfillment ?? 'both',
    })
    .select()
    .single()

  if (productError) {
    return NextResponse.json({ error: productError.message }, { status: 500 })
  }

  // Insert images
  if (Array.isArray(imageUrls) && imageUrls.length > 0) {
    const imageRows = imageUrls.map((url: string, idx: number) => ({
      product_id: product.id,
      url,
      display_order: idx,
    }))
    await supabase.from('product_images').insert(imageRows)
  }

  return NextResponse.json(product, { status: 201 })
}
