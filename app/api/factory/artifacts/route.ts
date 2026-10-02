import { NextResponse } from 'next/server'
import { listOwnedArtifacts } from '@/lib/enterprise/artifact-repository'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'authentication_required' }, { status: 401 })
  }

  try {
    const artifacts = await listOwnedArtifacts(user.id)
    return NextResponse.json({ artifacts })
  } catch (error) {
    return NextResponse.json({
      error: 'artifact_registry_unavailable',
      detail: error instanceof Error ? error.message : 'unknown_error',
    }, { status: 500 })
  }
}
