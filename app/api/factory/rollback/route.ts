import { NextResponse } from 'next/server'
import { createDeploymentRequest, type DeploymentEvidence } from '@/lib/enterprise/deployment'
import { getOwnedReleaseApproval, getOwnedReleasePackage, persistDeploymentEvidence } from '@/lib/enterprise/release-deployment-repository'
import { createServerSupabaseClient } from '@/lib/supabase-server'\nimport { getOwnedDeploymentEvidence, getLatestOwnedDeploymentState, persistDeploymentState } from '@/lib/enterprise/release-deployment-repository'\nimport { assertVerifiedDeployment, computeDeploymentStateHash } from '@/lib/enterprise/deployment-state'

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'authentication_required' }, { status: 401 })
  const body = await request.json().catch(() => null)
  if (!body?.releaseCandidateId || !body?.buildId || !body?.approvalId || !body?.organizationId || !body?.environment || !body?.targetDeploymentId) return NextResponse.json({ error: 'releaseCandidateId, buildId, approvalId, organizationId, environment and targetDeploymentId are required' }, { status: 400 })
  const webhookUrl = process.env.DEPLOYMENT_WEBHOOK_URL
  const webhookSecret = process.env.DEPLOYMENT_WEBHOOK_SECRET
  if (!webhookUrl || !webhookSecret) return NextResponse.json({ error: 'deployment_provider_not_configured' }, { status: 503 })
  const target = await getOwnedDeploymentEvidence(user.id, String(body.targetDeploymentId))\n  if (!target || target.action !== 'deploy' || target.status !== 'succeeded' || target.organizationId !== String(body.organizationId) || target.environment !== String(body.environment) || target.provider !== String(process.env.DEPLOYMENT_PROVIDER || 'webhook')) return NextResponse.json({ error: 'rollback_target_invalid' }, { status: 422 })\n  try { assertVerifiedDeployment({ state: (await getLatestOwnedDeploymentState(user.id, target.deploymentId))?.state || 'failed', verificationStatus: target.verificationStatus, providerReference: target.providerReference }) } catch (err) { return NextResponse.json({ error: err instanceof Error ? err.message : 'rollback_target_not_verified' }, { status: 422 }) }\n  const pkg = await getOwnedReleasePackage(user.id, String(body.releaseCandidateId), String(body.buildId))
  const approval = await getOwnedReleaseApproval(user.id, String(body.approvalId))
  if (!pkg || !approval) return NextResponse.json({ error: 'release_package_or_approval_not_found' }, { status: 404 })
  let reqData: ReturnType<typeof createDeploymentRequest>
  try {
    reqData = createDeploymentRequest({ candidate: pkg.candidate, build: pkg.build, approval, environment: String(body.environment), action: 'rollback', provider: String(process.env.DEPLOYMENT_PROVIDER || 'webhook'), rollbackTargetDeploymentId: String(body.targetDeploymentId) })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'rollback_gate_failed' }, { status: 422 })
  }
  const payload = JSON.stringify(reqData.body)
  await persistDeploymentState({ deploymentId: reqData.deploymentId, ownerId: user.id, organizationId: approval.organizationId, environment, state: 'requested', transitionAction: 'request', evidenceHash: reqData.requestHash, stateHash: computeDeploymentStateHash({ deploymentId: reqData.deploymentId, state: 'requested', action: 'request', evidenceHash: reqData.requestHash, changedAt: new Date().toISOString() }) })
  const startedAt = new Date().toISOString()
  const signature = signDeploymentRequest(payload, webhookSecret)
  let status: DeploymentEvidence['status'] = 'failed'
  let providerReference = 'unavailable'
  try {
    const response = await fetch(webhookUrl, { method: 'POST', headers: { 'content-type': 'application/json', 'x-deployment-signature': signature }, body: payload })
    const text = await response.text()
    if (!response.ok) throw new Error('rollback_provider_rejected')
    providerReference = text.slice(0, 500) || 'accepted'
    status = 'succeeded'
  } catch (err) {
    providerReference = err instanceof Error ? err.message : 'rollback_provider_failed'
  }
  const evidence: DeploymentEvidence = {
    deploymentId: reqData.deploymentId, approvalId: approval.approvalId, releaseCandidateId: pkg.candidate.releaseCandidateId, buildId: pkg.build.buildId,
    executionId: pkg.build.executionId, organizationId: approval.organizationId, ownerId: user.id, environment: String(body.environment),
    action: 'rollback', status, provider: String(process.env.DEPLOYMENT_PROVIDER || 'webhook'), providerReference,
    packageFingerprint: pkg.build.packageFingerprint, requestHash: reqData.requestHash, deploymentEngineVersion: '1.0.0', startedAt, completedAt: new Date().toISOString(),\n    verificationStatus: 'pending', verificationReference: 'verification_not_run', rollbackTargetDeploymentId: target.deploymentId,
  }
  await persistDeploymentEvidence(evidence)
  return NextResponse.json({ evidence, rollbackEligible: status === 'succeeded' }, { status: status === 'succeeded' ? 200 : 502 })
}
