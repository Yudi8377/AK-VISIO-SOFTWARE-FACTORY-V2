import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getLatestOwnedDeploymentState } from '@/lib/enterprise/release-deployment-repository'

export async function GET(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'authentication_required' }, { status: 401 })
  const url = new URL(request.url)
  const deploymentId = url.searchParams.get('deploymentId')
  if (!deploymentId) return NextResponse.json({ error: 'deploymentId is required' }, { status: 400 })
  const state = await getLatestOwnedDeploymentState(user.id, deploymentId)
  if (!state) return NextResponse.json({ error: 'deployment_state_not_found' }, { status: 404 })
  return NextResponse.json({ state })
}
