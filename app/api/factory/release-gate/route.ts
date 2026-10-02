import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getOwnedDeploymentEvidence, getLatestOwnedDeploymentState, getOwnedReleaseApproval } from '@/lib/enterprise/release-deployment-repository'
import { createReleaseGateDecision } from '@/lib/enterprise/release-gate'

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'authentication_required' }, { status: 401 })
  const body = await request.json().catch(() => null)
  if (!body?.deploymentId || !body?.approvalId || !body?.environment) {
    return NextResponse.json({ error: 'deploymentId, approvalId and environment are required' }, { status: 400 })
  }

  const evidence = await getOwnedDeploymentEvidence(user.id, String(body.deploymentId))
  const state = await getLatestOwnedDeploymentState(user.id, String(body.deploymentId))
  const approval = await getOwnedReleaseApproval(user.id, String(body.approvalId))
  if (!evidence || !state || !approval) return NextResponse.json({ error: 'release_gate_inputs_not_found' }, { status: 404 })

  const decision = createReleaseGateDecision({
    state: state.state,
    environment: String(body.environment),
    providerReference: evidence.providerReference,
    verificationStatus: evidence.verificationStatus,
    packageFingerprint: evidence.packageFingerprint,
    approvalPackageFingerprint: approval.packageFingerprint,
    approvalEnvironment: approval.environment,
    approvalStatus: approval.status,
  })
  return NextResponse.json({ deploymentId: evidence.deploymentId, decision }, { status: decision.decision === 'eligible' ? 200 : 422 })
}
