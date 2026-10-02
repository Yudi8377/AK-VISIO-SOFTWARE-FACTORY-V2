import { createServerSupabaseAdminClient, createServerSupabaseClient } from '@/lib/supabase-server'
import type { ReleaseApproval, DeploymentEvidence } from './deployment.ts'
import type { ReleaseCandidate } from './release.ts'\nimport type { DeploymentLifecycleState, DeploymentLifecycleAction } from './deployment-state.ts'
import type { BuildEvidence } from './build.ts'

function candidateFromRow(row: Record<string, unknown>): ReleaseCandidate {
  return { releaseCandidateId: String(row.release_candidate_id), executionId: String(row.execution_id), artifactIds: Array.isArray(row.artifact_ids) ? row.artifact_ids.map(String) : [], qualityEvidenceId: String(row.quality_evidence_id), qualityEvidenceHash: String(row.quality_evidence_hash), status: row.status as ReleaseCandidate['status'], buildStatus: row.build_status as ReleaseCandidate['buildStatus'], releaseEngineVersion: String(row.release_engine_version), candidateHash: String(row.candidate_hash), createdAt: String(row.created_at) }
}
function buildFromRow(row: Record<string, unknown>): BuildEvidence {
  return { buildId: String(row.build_id), releaseCandidateId: String(row.release_candidate_id), executionId: String(row.execution_id), status: row.status as BuildEvidence['status'], buildEngineVersion: String(row.build_engine_version), candidateHash: String(row.candidate_hash), qualityEvidenceHash: String(row.quality_evidence_hash), artifactIds: Array.isArray(row.artifact_ids) ? row.artifact_ids.map(String) : [], artifactHashes: Array.isArray(row.artifact_hashes) ? row.artifact_hashes as BuildEvidence['artifactHashes'] : [], sourceRevision: String(row.source_revision), packageFingerprint: String(row.package_fingerprint), builtAt: String(row.built_at) }
}
function approvalFromRow(row: Record<string, unknown>): ReleaseApproval {
  return { approvalId: String(row.approval_id), releaseCandidateId: String(row.release_candidate_id), buildId: String(row.build_id), executionId: String(row.execution_id), organizationId: String(row.organization_id), ownerId: String(row.owner_id), environment: String(row.environment), packageFingerprint: String(row.package_fingerprint), approvedBy: String(row.approved_by), status: row.status as ReleaseApproval['status'], approvalHash: String(row.approval_hash), approvedAt: String(row.approved_at) }
}
export async function getOwnedReleasePackage(ownerId: string, releaseCandidateId: string, buildId: string) {
  const supabase = await createServerSupabaseClient()
  const [candidateResult, buildResult] = await Promise.all([
    supabase.from('factory_release_candidates').select('*').eq('owner_id', ownerId).eq('release_candidate_id', releaseCandidateId).maybeSingle(),
    supabase.from('factory_build_evidence').select('*').eq('owner_id', ownerId).eq('build_id', buildId).maybeSingle(),
  ])
  if (candidateResult.error) throw candidateResult.error
  if (buildResult.error) throw buildResult.error
  if (!candidateResult.data || !buildResult.data) return null
  return { candidate: candidateFromRow(candidateResult.data), build: buildFromRow(buildResult.data) }
}
export async function getOwnedReleaseApproval(ownerId: string, approvalId: string) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.from('factory_release_approvals').select('*').eq('owner_id', ownerId).eq('approval_id', approvalId).maybeSingle()
  if (error) throw error
  return data ? approvalFromRow(data) : null
}
export async function persistReleaseApproval(approval: ReleaseApproval) {
  const supabase = createServerSupabaseAdminClient()
  const { error } = await supabase.from('factory_release_approvals').upsert({
    approval_id: approval.approvalId, release_candidate_id: approval.releaseCandidateId, build_id: approval.buildId, execution_id: approval.executionId,
    organization_id: approval.organizationId, owner_id: approval.ownerId, environment: approval.environment, package_fingerprint: approval.packageFingerprint,
    approved_by: approval.approvedBy, status: approval.status, approval_hash: approval.approvalHash, approved_at: approval.approvedAt,
  }, { onConflict: 'owner_id,approval_id' })
  if (error) throw error
}
export async function persistDeploymentEvidence(evidence: DeploymentEvidence) {
  const supabase = createServerSupabaseAdminClient()
  const { error } = await supabase.from('factory_deployment_evidence').upsert({
    deployment_id: evidence.deploymentId, approval_id: evidence.approvalId, release_candidate_id: evidence.releaseCandidateId, build_id: evidence.buildId,
    execution_id: evidence.executionId, organization_id: evidence.organizationId, owner_id: evidence.ownerId, environment: evidence.environment,
    action: evidence.action, status: evidence.status, provider: evidence.provider, provider_reference: evidence.providerReference,
    package_fingerprint: evidence.packageFingerprint, request_hash: evidence.requestHash, deployment_engine_version: evidence.deploymentEngineVersion,
    started_at: evidence.startedAt, completed_at: evidence.completedAt,
  }, { onConflict: 'owner_id,deployment_id' })
  if (error) throw error
}
export async function getOwnedDeploymentEvidence(ownerId: string, deploymentId: string) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.from('factory_deployment_evidence').select('*').eq('owner_id', ownerId).eq('deployment_id', deploymentId).maybeSingle()
  if (error) throw error
  return data ? deploymentFromRow(data) : null
}

function deploymentFromRow(row: Record<string, unknown>): DeploymentEvidence {
  return {
    deploymentId: String(row.deployment_id), approvalId: String(row.approval_id), releaseCandidateId: String(row.release_candidate_id),
    buildId: String(row.build_id), executionId: String(row.execution_id), organizationId: String(row.organization_id), ownerId: String(row.owner_id),
    environment: String(row.environment), action: row.action as DeploymentEvidence['action'], status: row.status as DeploymentEvidence['status'],
    provider: String(row.provider), providerReference: String(row.provider_reference), packageFingerprint: String(row.package_fingerprint),
    requestHash: String(row.request_hash), deploymentEngineVersion: String(row.deployment_engine_version),
    startedAt: String(row.started_at), completedAt: String(row.completed_at),
    verificationStatus: row.verification_status as DeploymentEvidence['verificationStatus'],
    verificationReference: String(row.verification_reference),
    verifiedAt: row.verified_at ? String(row.verified_at) : undefined,
    rollbackTargetDeploymentId: row.rollback_target_deployment_id ? String(row.rollback_target_deployment_id) : undefined,
  }
}

export async function persistDeploymentState(input: {
  deploymentId: string
  ownerId: string
  organizationId: string
  environment: string
  state: DeploymentLifecycleState
  previousState?: DeploymentLifecycleState
  transitionAction: DeploymentLifecycleAction
  evidenceHash: string
  stateHash: string
}) {
  const supabase = createServerSupabaseAdminClient()
  const { error } = await supabase.from('factory_deployment_state').insert({
    deployment_id: input.deploymentId, owner_id: input.ownerId, organization_id: input.organizationId,
    environment: input.environment, state: input.state, previous_state: input.previousState ?? null,
    transition_action: input.transitionAction, evidence_hash: input.evidenceHash, state_hash: input.stateHash,
  })
  if (error) throw error
}

export async function getLatestOwnedDeploymentState(ownerId: string, deploymentId: string) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.from('factory_deployment_state').select('*').eq('owner_id', ownerId).eq('deployment_id', deploymentId).order('changed_at', { ascending: false }).limit(1).maybeSingle()
  if (error) throw error
  return data ? {
    deploymentId: String(data.deployment_id), state: data.state as DeploymentLifecycleState,
    organizationId: String(data.organization_id), environment: String(data.environment),
  } : null
}

export async function persistPromotionEvidence(input: {
  promotionId: string
  deploymentId: string
  ownerId: string
  organizationId: string
  sourceEnvironment: string
  targetStage: 'staging' | 'production'
  decision: 'promote' | 'blocked'
  evidenceHash: string
  approvedBy?: string
}) {
  const supabase = createServerSupabaseAdminClient()
  const { error } = await supabase.from('factory_promotion_evidence').upsert({
    promotion_id: input.promotionId, deployment_id: input.deploymentId, owner_id: input.ownerId,
    organization_id: input.organizationId, source_environment: input.sourceEnvironment, target_stage: input.targetStage,
    decision: input.decision, evidence_hash: input.evidenceHash, approved_by: input.approvedBy ?? null,
  }, { onConflict: 'owner_id,promotion_id' })
  if (error) throw error
}

export async function listOwnedReleaseApprovals(ownerId: string) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.from('factory_release_approvals').select('*').eq('owner_id', ownerId).order('approved_at', { ascending: false }).limit(200)
  if (error) throw error
  return data ?? []
}
export async function listOwnedDeploymentEvidence(ownerId: string) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.from('factory_deployment_evidence').select('*').eq('owner_id', ownerId).order('started_at', { ascending: false }).limit(200)
  if (error) throw error
  return data ?? []
}
