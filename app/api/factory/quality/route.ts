import { NextResponse } from 'next/server'
import { listOwnedQualityEvidence } from '@/lib/enterprise/quality-repository'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'authentication_required' }, { status: 401 })
  }

  try {
    return NextResponse.json({ evidence: await listOwnedQualityEvidence(user.id) })
  } catch (error) {
    return NextResponse.json({
      error: 'quality_evidence_unavailable',
      detail: error instanceof Error ? error.message : 'unknown_error',
    }, { status: 500 })
  }
}
