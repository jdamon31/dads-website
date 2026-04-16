import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient, createAdminClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

interface Params {
  params: { id: string }
}

// GET /api/products/[id] — public
export async function GET(_req: NextRequest, { params }: Params) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, images:product_images(*)')
    .eq('id', params.id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}

// PATCH /api/products/[id] — admin only
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const supabase = createAdminClient()

  // Fetch current slug before update (needed for revalidation)
  const { data: current } = await supabase
    .from('products')
    .select('slug')
    .eq('id', params.id)
    .single()

  const { imageUrls, ...fields } = body

  const { data, error } = await supabase
    .from('products')
    .update(fields)
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Replace images if provided
  if (Array.isArray(imageUrls)) {
    await supabase.from('product_images').delete().eq('product_id', params.id)
    if (imageUrls.length > 0) {
      await supabase.from('product_images').insert(
        imageUrls.map((url: string, idx: number) => ({
          product_id: params.id,
          url,
          display_order: idx,
        }))
      )
    }
  }

  // Revalidate the product's public page
  const slug = data.slug ?? current?.slug
  if (slug) {
    revalidatePath(`/products/${slug}`)
  }
  revalidatePath('/')

  return NextResponse.json(data)
}

// DELETE /api/products/[id] — admin only
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Fetch images before deleting (for Storage cleanup)
  const { data: images } = await supabase
    .from('product_images')
    .select('url')
    .eq('product_id', params.id)

  // Delete product (cascades to images rows)
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Remove files from Supabase Storage
  if (images && images.length > 0) {
    const paths = images.map((img) => {
      const url = new URL(img.url)
      // Path format: /storage/v1/object/public/product-images/<filename>
      return url.pathname.split('/product-images/')[1]
    }).filter(Boolean)

    if (paths.length > 0) {
      await supabase.storage.from('product-images').remove(paths)
    }
  }

  revalidatePath('/')
  return NextResponse.json({ success: true })
}
