import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase-server'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const files = formData.getAll('files') as File[]

  if (!files.length) {
    return NextResponse.json({ error: 'No files provided' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const urls: string[] = []

  for (const file of files) {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${randomUUID()}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error } = await supabase.storage
      .from('product-images')
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      return NextResponse.json({ error: `Upload failed: ${error.message}` }, { status: 500 })
    }

    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(path)

    urls.push(urlData.publicUrl)
  }

  return NextResponse.json({ urls })
}
