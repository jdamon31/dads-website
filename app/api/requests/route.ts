import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase-server'
import { sendItemRequestEmail } from '@/lib/email'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('item_requests')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const { name, email, phone, description } = await req.json()
  if (!name?.trim() || !email?.trim() || !description?.trim()) {
    return NextResponse.json({ error: 'Name, email, and description are required' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { error } = await supabase
    .from('item_requests')
    .insert({ name: name.trim(), email: email.trim(), phone: phone?.trim() || null, description: description.trim() })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  try {
    await sendItemRequestEmail({ name, email, phone, description })
  } catch (err) {
    console.error('Failed to send item request email:', err)
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
