import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getOwnedDeploymentEvidence, getLatestOwnedDeploymentState, getOwnedReleaseApproval, persistDeploymentState, persistPromotionEvidence } from '@/lib/enterprise/release-deployment-repository'
import { createPromotionDecision } from '@/lib/enterprise/promotion'
import { assertDeploymentTransition, computeDeploymentStateHash } from '@/lib/enterprise/deployment-state'

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'authentication_required' }, { status: 401 })
  const body = await request.json().catch(() => null)
  if (!body?.deploymentId || !body?.targetStage || !body?.environment || !body?.organizationId) {
    return NextResponse.json({ error: 'deploymentId, targetStage, environment and organizationId are required' }, { status: 400 })
  }
  if (body.targetStage !== 'staging' && body.targetStage !== 'production') {
    return NextResponse.json({ error: 'invalid_targetStage' }, { status: 400 })
  }

  const evidence = await getOwnedDeploymentEvidence(user.id, String(body.deploymentId))
  const state = await getLatestOwnedDeploymentState(user.id, String(body.deploymentId))
  if (!evidence || !state) return NextResponse.json({ error: 'deployment_or_state_not_found' }, { status: 404 })
  if (evidence.organizationId !== String(body.organizationId) || evidence.environment !== String(body.environment)) {
    return NextResponse.json({ error: 'promotion_scope_mismatch' }, { status: 422 })
  }

  const approval = body.targetStage === 'production' && body.approvalId
    ? await getOwnedReleaseApproval(user.id, String(body.approvalId))
    : null

  let decision
  try {
    decision = createPromotionDecision(
      evidence,
      body.targetStage,
      String(body.environment),
      state.state,
      approval ? { packageFingerprint: approval.packageFingerprint, environment: approval.environment, status: approval.status } : undefined,
    )
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'promotion_gate_failed' }, { status: 422 })
  }

  const nextState = assertDeploymentTransition(state.state, 'promote')
  const changedAt = new Date().toISOString()
  await persistPromotionEvidence({
    promotionId: decision.decisionId,
    deploymentId: evidence.deploymentId,
    ownerId: user.id,
    organizationId: evidence.organizationId,
    sourceEnvironment: evidence.environment,
    targetStage: body.targetStage,
    decision: decision.decision,
    evidenceHash: decision.evidenceHash,
    approvedBy: approval?.approvedBy,
  })
  await persistDeploymentState({
    deploymentId: evidence.deploymentId,
    ownerId: user.id,
    organizationId: evidence.organizationId,
    environment: evidence.environment,
    state: nextState,
    previousState: state.state,
    transitionAction: 'promote',
    evidenceHash: decision.evidenceHash,
    stateHash: computeDeploymentStateHash({
      deploymentId: evidence.deploymentId,
      state: nextState,
      action: 'promote',
      evidenceHash: decision.evidenceHash,
      changedAt,
    }),
  })

  return NextResponse.json({ decision, state: nextState, deploymentId: evidence.deploymentId })
}
