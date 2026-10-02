import { NextResponse } from 'next/server'
import { createServerSupabaseAdminClient } from '@/lib/supabase-server'
import { createDeploymentRequest, type DeploymentEvidence } from '@/lib/enterprise/deployment'
import { executeConfiguredProvider } from '@/lib/enterprise/provider'
import { createRecoveryDecision } from '@/lib/enterprise/monitoring'
import { createRecoveryExecution, assertTrustedRecoveryInvocation } from '@/lib/enterprise/recovery'
import {
  getTrustedRecoveryContext,
  getTrustedReleaseApproval,
  getTrustedReleasePackage,
  getTrustedRecoveryEvidence,
  persistDeploymentEvidence,
  persistDeploymentState,
} from '@/lib/enterprise/release-deployment-repository'
import { assessDeploymentHealth } from '@/lib/enterprise/monitoring'
import { computeDeploymentStateHash } from '@/lib/enterprise/deployment-state'
import { acquireRecoveryIncident, markRecoveryFailure, markRecoveryStarted } from '@/lib/enterprise/self-healing-repository'
import { createRecoveryIncidentKey } from '@/lib/enterprise/self-healing'\nimport { appendAuditEvent } from '@/lib/enterprise/audit-ledger'

async function persistRecoveryEvidence(input: {
  recoveryId: string
  ownerId: string
  organizationId: string
  environment: string
  currentDeploymentId: string
  targetDeploymentId: string
  decision: 'eligible' | 'blocked'
  evidenceHash: string
}) {
  const supabase = createServerSupabaseAdminClient()
  const { error } = await supabase.from('factory_recovery_evidence').upsert({
    recovery_id: input.recoveryId,
    owner_id: input.ownerId,
    organization_id: input.organizationId,
    environment: input.environment,
    current_deployment_id: input.currentDeploymentId,
    target_deployment_id: input.targetDeploymentId,
    decision: input.decision,
    evidence_hash: input.evidenceHash,
  }, { onConflict: 'owner_id,recovery_id' })
  if (error) throw error
}

export async function POST(request: Request) {
  try {
    assertTrustedRecoveryInvocation(process.env.AUTONOMOUS_RECOVERY_SECRET, request.headers.get('x-autonomous-recovery-secret'))
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'trusted_recovery_invocation_required' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (!body?.ownerId || !body?.currentDeploymentId || !body?.targetDeploymentId || !body?.organizationId || !body?.environment) {
    return NextResponse.json({ error: 'ownerId, currentDeploymentId, targetDeploymentId, organizationId and environment are required' }, { status: 400 })
  }

  const ownerId = String(body.ownerId)
  const currentDeploymentId = String(body.currentDeploymentId)
  const targetDeploymentId = String(body.targetDeploymentId)
  const organizationId = String(body.organizationId)
  const environment = String(body.environment)
  const maxAgeSeconds = Number(body.maxAgeSeconds ?? 3600)
  if (!Number.isFinite(maxAgeSeconds) || maxAgeSeconds < 1 || maxAgeSeconds > 86400) {
    return NextResponse.json({ error: 'invalid_maxAgeSeconds' }, { status: 400 })
  }

  const context = await getTrustedRecoveryContext(ownerId, currentDeploymentId, targetDeploymentId)
  const current = context.current
  const target = context.target
  const currentState = context.currentState
  const targetState = context.targetState
  if (!current || !target || !currentState || !targetState) {
    return NextResponse.json({ error: 'recovery_deployment_not_found' }, { status: 404 })
  }
  if (current.organizationId !== organizationId || target.organizationId !== organizationId || current.environment !== environment || target.environment !== environment) {
    return NextResponse.json({ error: 'recovery_scope_mismatch' }, { status: 422 })
  }

  const checkedAt = new Date().toISOString()
  const health = assessDeploymentHealth({ evidence: current, state: currentState.state, checkedAt, maxAgeSeconds })
  if (health.health !== 'unhealthy') {
    return NextResponse.json({ recovery: 'not_required', deploymentId: currentDeploymentId, health }, { status: 200 })
  }

  let decision
  try {
    decision = createRecoveryDecision({
      current,
      currentState: currentState.state,
      target,
      targetState: targetState.state,
      health: health.health,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'recovery_gate_failed'
    return NextResponse.json({ error: message, health }, { status: 422 })
  }

  const incident = await acquireRecoveryIncident({ ownerId, organizationId, environment, currentDeploymentId, targetDeploymentId, healthEvidenceHash: decision.evidenceHash })
  if (!incident.acquired) return NextResponse.json({ recovery: 'suppressed', reason: incident.reason, status: 'status' in incident ? incident.status : undefined, incident: 'incident' in incident ? incident.incident : undefined, health }, { status: 200 })

  const incidentKey = createRecoveryIncidentKey({ ownerId, organizationId, environment, currentDeploymentId, targetDeploymentId })\n  await appendAuditEvent({ ownerId, organizationId, environment, eventType: 'recovery.detected', aggregateType: 'recovery-incident', aggregateId: incidentKey, actorType: 'scheduler', payload: { currentDeploymentId, targetDeploymentId, health: health.health, evidenceHash: decision.evidenceHash } })
  const leaseToken = String(incident.incident.lease_token)
  const execution = createRecoveryExecution({
    currentDeploymentId,
    targetDeploymentId,
    organizationId,
    environment,
    provider: target.provider,
    decisionId: decision.decisionId,
    evidenceHash: decision.evidenceHash,
    attempt: incident.attempt,
  })
  const existingRecovery = await getTrustedRecoveryEvidence(ownerId, execution.recoveryId)
  if (existingRecovery) {
    return NextResponse.json({
      recoveryId: execution.recoveryId,
      decision: 'already_executed',
      existingRecovery,
      health,
    }, { status: 200 })
  }
  const approval = await getTrustedReleaseApproval(ownerId, target.approvalId)
  const pkg = await getTrustedReleasePackage(ownerId, target.releaseCandidateId, target.buildId)
  if (!approval || !pkg) { await markRecoveryFailure(ownerId, incidentKey, leaseToken, 'target_release_lineage_not_found'); return NextResponse.json({ error: 'target_release_lineage_not_found' }, { status: 404 }) }
  if (approval.organizationId !== organizationId || approval.environment !== environment || approval.packageFingerprint !== target.packageFingerprint) {
    await markRecoveryFailure(ownerId, incidentKey, leaseToken, 'target_release_lineage_mismatch')
    return NextResponse.json({ error: 'target_release_lineage_mismatch' }, { status: 422 })
  }

  const webhookUrl = process.env.DEPLOYMENT_WEBHOOK_URL
  const webhookSecret = process.env.DEPLOYMENT_WEBHOOK_SECRET
  if (!webhookUrl || !webhookSecret) { await markRecoveryFailure(ownerId, incidentKey, leaseToken, 'deployment_provider_not_configured'); return NextResponse.json({ error: 'deployment_provider_not_configured' }, { status: 503 }) }

  let reqData: ReturnType<typeof createDeploymentRequest>
  try {
    reqData = createDeploymentRequest({
      candidate: pkg.candidate,
      build: pkg.build,
      approval,
      environment,
      action: 'rollback',
      provider: target.provider,
      rollbackTargetDeploymentId: target.deploymentId,
    })
  } catch (error) {
    await markRecoveryFailure(ownerId, incidentKey, leaseToken, error instanceof Error ? error.message : 'rollback_gate_failed')
    return NextResponse.json({ error: error instanceof Error ? error.message : 'rollback_gate_failed' }, { status: 422 })
  }

  const requestedAt = new Date().toISOString()
  await persistDeploymentState({
    deploymentId: reqData.deploymentId,
    ownerId,
    organizationId,
    environment,
    state: 'requested',
    transitionAction: 'request',
    evidenceHash: reqData.requestHash,
    stateHash: computeDeploymentStateHash({ deploymentId: reqData.deploymentId, state: 'requested', action: 'request', evidenceHash: reqData.requestHash, changedAt: requestedAt }),
  })

  const startedAt = new Date().toISOString()
  let status: DeploymentEvidence['status'] = 'failed'
  let providerReference = 'unavailable'
  try {
    const result = await executeConfiguredProvider({ body: reqData.body, webhookUrl, webhookSecret })
    status = result.accepted ? 'succeeded' : 'failed'
    providerReference = result.providerReference
  } catch (error) {
    providerReference = error instanceof Error ? error.message : 'recovery_provider_failed'
  }

  const completedAt = new Date().toISOString()
  const evidence: DeploymentEvidence = {
    deploymentId: reqData.deploymentId,
    approvalId: approval.approvalId,
    releaseCandidateId: pkg.candidate.releaseCandidateId,
    buildId: pkg.build.buildId,
    executionId: pkg.build.executionId,
    organizationId,
    ownerId,
    environment,
    action: 'rollback',
    status,
    provider: target.provider,
    providerReference,
    packageFingerprint: pkg.build.packageFingerprint,
    requestHash: reqData.requestHash,
    deploymentEngineVersion: '1.0.0',
    startedAt,
    completedAt,
    verificationStatus: 'pending',
    verificationReference: 'verification_not_run',
    rollbackTargetDeploymentId: target.deploymentId,
    recoveryIncidentKey: incidentKey,
  }
  await persistRecoveryEvidence({
    recoveryId: execution.recoveryId,
    ownerId,
    organizationId,
    environment,
    currentDeploymentId,
    targetDeploymentId,
    decision: 'eligible',
    evidenceHash: execution.requestHash,
  })

  await persistDeploymentEvidence(evidence)
  await markRecoveryStarted(ownerId, incidentKey, leaseToken, execution.recoveryId)

  const state = status === 'succeeded' ? 'provider_accepted' as const : 'failed' as const
  const action = status === 'succeeded' ? 'provider_accept' as const : 'fail' as const
  await persistDeploymentState({
    deploymentId: evidence.deploymentId,
    ownerId,
    organizationId,
    environment,
    state,
    previousState: 'requested',
    transitionAction: action,
    evidenceHash: evidence.requestHash,
    stateHash: computeDeploymentStateHash({ deploymentId: evidence.deploymentId, state, action, evidenceHash: evidence.requestHash, changedAt: completedAt }),
  })

  if (status !== 'succeeded') await markRecoveryFailure(ownerId, incidentKey, leaseToken, providerReference)\n  await appendAuditEvent({ ownerId, organizationId, environment, eventType: status === 'succeeded' ? 'recovery.provider_accepted' : 'recovery.failed', aggregateType: 'recovery-execution', aggregateId: execution.recoveryId, actorType: 'scheduler', payload: { deploymentId: evidence.deploymentId, currentDeploymentId, targetDeploymentId, status, provider: target.provider } })

  return NextResponse.json({
    recoveryId: execution.recoveryId,
    decision,
    health,
    evidence,
    nextStep: status === 'succeeded' ? 'verify_then_rollback_transition' : 'provider_retry_required',
  }, { status: status === 'succeeded' ? 200 : 502 })
}
