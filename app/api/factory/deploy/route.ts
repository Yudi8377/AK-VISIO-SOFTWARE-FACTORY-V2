import { NextResponse } from 'next/server'
import { createDeploymentRequest, type DeploymentEvidence } from '@/lib/enterprise/deployment'
import { executeConfiguredProvider } from '@/lib/enterprise/provider'
import {
  getOwnedReleaseApproval,
  getOwnedReleasePackage,
  persistDeploymentEvidence,
  persistDeploymentState,
} from '@/lib/enterprise/release-deployment-repository'
import { computeDeploymentStateHash } from '@/lib/enterprise/deployment-state'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'authentication_required' }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (!body?.releaseCandidateId || !body?.buildId || !body?.approvalId || !body?.organizationId || !body?.environment) {
    return NextResponse.json({ error: 'releaseCandidateId, buildId, approvalId, organizationId and environment are required' }, { status: 400 })
  }

  const webhookUrl = process.env.DEPLOYMENT_WEBHOOK_URL
  const webhookSecret = process.env.DEPLOYMENT_WEBHOOK_SECRET
  if (!webhookUrl || !webhookSecret) return NextResponse.json({ error: 'deployment_provider_not_configured' }, { status: 503 })

  const environment = String(body.environment)
  const provider = String(process.env.DEPLOYMENT_PROVIDER || 'webhook')
  const pkg = await getOwnedReleasePackage(user.id, String(body.releaseCandidateId), String(body.buildId))
  const approval = await getOwnedReleaseApproval(user.id, String(body.approvalId))
  if (!pkg || !approval) return NextResponse.json({ error: 'release_package_or_approval_not_found' }, { status: 404 })
  if (approval.organizationId !== String(body.organizationId)) return NextResponse.json({ error: 'organization_scope_mismatch' }, { status: 422 })

  let reqData: ReturnType<typeof createDeploymentRequest>
  try {
    reqData = createDeploymentRequest({ candidate: pkg.candidate, build: pkg.build, approval, environment, action: 'deploy', provider })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'deployment_gate_failed' }, { status: 422 })
  }

  const requestedAt = new Date().toISOString()
  await persistDeploymentState({
    deploymentId: reqData.deploymentId,
    ownerId: user.id,
    organizationId: approval.organizationId,
    environment,
    state: 'requested',
    transitionAction: 'request',
    evidenceHash: reqData.requestHash,
    stateHash: computeDeploymentStateHash({
      deploymentId: reqData.deploymentId,
      state: 'requested',
      action: 'request',
      evidenceHash: reqData.requestHash,
      changedAt: requestedAt,
    }),
  })

  const startedAt = new Date().toISOString()
  let status: DeploymentEvidence['status'] = 'failed'
  let providerReference = 'unavailable'
  try {
    const result = await executeConfiguredProvider({ body: reqData.body, webhookUrl, webhookSecret })
    status = result.accepted ? 'succeeded' : 'failed'
    providerReference = result.providerReference
  } catch (err) {
    providerReference = err instanceof Error ? err.message : 'deployment_provider_failed'
  }

  const completedAt = new Date().toISOString()
  const evidence: DeploymentEvidence = {
    deploymentId: reqData.deploymentId,
    approvalId: approval.approvalId,
    releaseCandidateId: pkg.candidate.releaseCandidateId,
    buildId: pkg.build.buildId,
    executionId: pkg.build.executionId,
    organizationId: approval.organizationId,
    ownerId: user.id,
    environment,
    action: 'deploy',
    status,
    provider,
    providerReference,
    packageFingerprint: pkg.build.packageFingerprint,
    requestHash: reqData.requestHash,
    deploymentEngineVersion: '1.0.0',
    startedAt,
    completedAt,
    verificationStatus: 'pending',
    verificationReference: 'verification_not_run',
  }

  await persistDeploymentEvidence(evidence)
  const state = status === 'succeeded' ? 'provider_accepted' as const : 'failed' as const
  const action = status === 'succeeded' ? 'provider_accept' as const : 'fail' as const
  await persistDeploymentState({
    deploymentId: evidence.deploymentId,
    ownerId: user.id,
    organizationId: evidence.organizationId,
    environment: evidence.environment,
    state,
    previousState: 'requested',
    transitionAction: action,
    evidenceHash: evidence.requestHash,
    stateHash: computeDeploymentStateHash({
      deploymentId: evidence.deploymentId,
      state,
      action,
      evidenceHash: evidence.requestHash,
      changedAt: completedAt,
    }),
  })

  return NextResponse.json({ evidence, releaseEligible: false }, { status: status === 'succeeded' ? 200 : 502 })
}
