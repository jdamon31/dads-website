import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createStaticClient, createAdminClient } from '@/lib/supabase-server'
import { generateSlug } from '@/lib/utils'
import { revalidatePath } from 'next/cache'

// GET /api/products — public, returns active products with images
export async function GET() {
  const supabase = createStaticClient()
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
  const { title, description, price, purchase_price, condition, category, status, fulfillment, is_special, offers_enabled, quantity, weight_oz, length_in, width_in, height_in, imageUrls } = body

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
      purchase_price: purchase_price ? Math.round(Number(purchase_price)) : null,
      condition,
      category,
      status: status ?? 'active',
      fulfillment: fulfillment ?? 'both',
      is_special: is_special ?? false,
      offers_enabled: offers_enabled ?? false,
      quantity: quantity ? Math.max(1, Math.round(Number(quantity))) : 1,
      weight_oz: weight_oz ?? null,
      length_in: length_in ?? null,
      width_in: width_in ?? null,
      height_in: height_in ?? null,
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

  // Bust the homepage and the new product's page so they appear immediately
  revalidatePath('/')
  revalidatePath(`/products/${slug}`)

  return NextResponse.json(product, { status: 201 })
}
