import { NextResponse } from 'next/server'
import { createServerSupabaseAdminClient } from '@/lib/supabase-server'
import { assertTrustedRecoveryInvocation } from '@/lib/enterprise/recovery'

export async function POST(request: Request) {
  try { assertTrustedRecoveryInvocation(process.env.AUTONOMOUS_RECOVERY_SECRET, request.headers.get('x-autonomous-recovery-secret')) }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'trusted_recovery_invocation_required' }, { status: 401 }) }

  const body = await request.json().catch(() => null)
  if (!body?.ownerId || !body?.organizationId || !body?.environment) {
    return NextResponse.json({ error: 'ownerId, organizationId and environment are required' }, { status: 400 })
  }

  const supabase = createServerSupabaseAdminClient()
  const { data, error } = await supabase
    .from('factory_deployment_evidence')
    .select('*')
    .eq('owner_id', String(body.ownerId))
    .eq('organization_id', String(body.organizationId))
    .eq('environment', String(body.environment))
    .eq('action', 'deploy')
    .eq('status', 'succeeded')
    .order('completed_at', { ascending: false })
    .limit(100)
  if (error) return NextResponse.json({ error: 'recovery_scan_failed' }, { status: 500 })

  const deployments = data ?? []
  if (deployments.length < 2) return NextResponse.json({ recovery: 'no_previous_verified_target', candidates: deployments.length }, { status: 200 })

  const states = await Promise.all(deployments.map(async row => {
    const result = await supabase.from('factory_deployment_state').select('state,changed_at').eq('owner_id', String(body.ownerId)).eq('deployment_id', String(row.deployment_id)).order('changed_at', { ascending: false }).limit(1).maybeSingle()
    return { row, state: result.data?.state ?? null, changedAt: result.data?.changed_at ?? null }
  }))

  const current = states[0]
  const target = states.find(item =>
    item.row.deployment_id !== current.row.deployment_id &&
    (item.state === 'verified' || item.state === 'promoted') &&
    item.row.verification_status === 'passed' &&
    item.row.provider_reference !== 'unavailable' &&
    item.row.provider === current.row.provider
  )
  if (!target) return NextResponse.json({ recovery: 'no_previous_verified_target', currentDeploymentId: current.row.deployment_id }, { status: 200 })

  return NextResponse.json({
    recovery: 'candidate_found',
    currentDeploymentId: String(current.row.deployment_id),
    targetDeploymentId: String(target.row.deployment_id),
    organizationId: String(body.organizationId),
    environment: String(body.environment),
  }, { status: 200 })
}
