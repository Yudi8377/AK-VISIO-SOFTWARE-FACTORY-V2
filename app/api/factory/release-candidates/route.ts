import { NextResponse } from 'next/server'
import { listOwnedReleaseCandidates } from '@/lib/enterprise/release-repository'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'authentication_required' }, { status: 401 })
  try {
    return NextResponse.json({ candidates: await listOwnedReleaseCandidates(user.id) })
  } catch (error) {
    return NextResponse.json({ error: 'release_candidates_unavailable', detail: error instanceof Error ? error.message : 'unknown_error' }, { status: 500 })
  }
}
