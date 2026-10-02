import { NextResponse } from 'next/server'
import { listOwnedDeploymentEvidence } from '@/lib/enterprise/release-deployment-repository'
import { createServerSupabaseClient } from '@/lib/supabase-server'
export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'authentication_required' }, { status: 401 })
  return NextResponse.json({ deployments: await listOwnedDeploymentEvidence(user.id) })
}
