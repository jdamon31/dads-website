import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase-server'
import { sendContactEmail } from '@/lib/email'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const { name, email, message } = await req.json()
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { error } = await supabase
    .from('contact_messages')
    .insert({ name: name.trim(), email: email.trim(), message: message.trim() })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  try {
    await sendContactEmail({ name, email, message })
  } catch (err) {
    console.error('Failed to send contact email:', err)
    // Still return success — message is saved in DB
  }

  return NextResponse.json({ success: true })
}
