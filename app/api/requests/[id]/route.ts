import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase-server'
import { sendRequestFulfilledEmail } from '@/lib/email'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { status } = await req.json()
  const supabase = createServiceClient()

  // Fetch request before updating (need email/name for fulfilled notification)
  const { data: existing } = await supabase
    .from('item_requests')
    .select('name, email, description')
    .eq('id', params.id)
    .single()

  const { data, error } = await supabase
    .from('item_requests')
    .update({ status })
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (status === 'fulfilled' && existing) {
    try {
      await sendRequestFulfilledEmail({
        name: existing.name,
        email: existing.email,
        description: existing.description,
      })
    } catch (err) {
      console.error('Failed to send fulfilled email:', err)
    }
  }

  return NextResponse.json(data)
}
