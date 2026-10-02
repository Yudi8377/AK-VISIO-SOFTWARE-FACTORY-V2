import { NextResponse } from 'next/server'
import { listOwnedBuildEvidence } from '@/lib/enterprise/build-repository'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'authentication_required' }, { status: 401 })
  return NextResponse.json({ builds: await listOwnedBuildEvidence(user.id) })
}
