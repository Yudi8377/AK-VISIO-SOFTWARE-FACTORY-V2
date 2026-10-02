import { createHmac, createHash } from 'node:crypto'
import { assertReleaseCandidateIntegrity, type ReleaseCandidate } from './release.ts'
import { assertBuildPassed, type BuildEvidence } from './build.ts'

export const DEPLOYMENT_ENGINE_VERSION = '1.0.0'
export type DeploymentAction = 'deploy' | 'rollback'
export type DeploymentStatus = 'succeeded' | 'failed'

export type ReleaseApproval = {
  approvalId: string
  releaseCandidateId: string
  buildId: string
  executionId: string
  organizationId: string
  ownerId: string
  environment: string
  packageFingerprint: string
  approvedBy: string
  status: 'approved' | 'rejected'
  approvalHash: string
  approvedAt: string
}

export type DeploymentEvidence = {
  deploymentId: string
  approvalId: string
  releaseCandidateId: string
  buildId: string
  executionId: string
  organizationId: string
  ownerId: string
  environment: string
  action: DeploymentAction
  status: DeploymentStatus
  provider: string
  providerReference: string
  packageFingerprint: string
  requestHash: string
  deploymentEngineVersion: string
  startedAt: string
  completedAt: string
}

function stable(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value)) return '[' + value.map(stable).join(',') + ']'
  const r = value as Record<string, unknown>
  return '{' + Object.keys(r).sort().map(k => JSON.stringify(k) + ':' + stable(r[k])).join(',') + '}'
}
function hash(value: unknown): string { return createHash('sha256').update(stable(value)).digest('hex') }

export function computeApprovalHash(input: Pick<ReleaseApproval, 'releaseCandidateId' | 'buildId' | 'executionId' | 'organizationId' | 'ownerId' | 'environment' | 'packageFingerprint' | 'approvedBy' | 'status'>): string {
  return hash(input)
}
export function createReleaseApproval(input: Omit<ReleaseApproval, 'approvalId' | 'approvalHash' | 'approvedAt'>): ReleaseApproval {
  const approvalHash = computeApprovalHash(input)
  return { ...input, approvalId: 'approval-' + approvalHash.slice(0, 24), approvalHash, approvedAt: new Date().toISOString() }
}
export function assertReleaseApprovalIntegrity(approval: ReleaseApproval): void {
  const expected = computeApprovalHash(approval)
  if (approval.status !== 'approved' || approval.approvalHash !== expected || approval.approvalId !== 'approval-' + expected.slice(0, 24)) throw new Error('release_approval_integrity_failed')
}
export function assertDeploymentEligible(candidate: ReleaseCandidate, build: BuildEvidence, approval: ReleaseApproval, environment: string): void {
  assertReleaseCandidateIntegrity(candidate)
  assertBuildPassed(build)
  assertReleaseApprovalIntegrity(approval)
  if (approval.releaseCandidateId !== candidate.releaseCandidateId || approval.buildId !== build.buildId) throw new Error('release_approval_target_mismatch')
  if (approval.packageFingerprint !== build.packageFingerprint) throw new Error('release_approval_fingerprint_mismatch')
  if (build.candidateHash !== candidate.candidateHash || build.qualityEvidenceHash !== candidate.qualityEvidenceHash) throw new Error('build_lineage_integrity_failed')
  if (approval.environment !== environment) throw new Error('deployment_environment_mismatch')
}
export function createDeploymentRequest(input: { candidate: ReleaseCandidate; build: BuildEvidence; approval: ReleaseApproval; environment: string; action: DeploymentAction; provider: string }): { deploymentId: string; requestHash: string; body: Record<string, unknown> } {
  assertDeploymentEligible(input.candidate, input.build, input.approval, input.environment)
  const body = { action: input.action, environment: input.environment, provider: input.provider, releaseCandidateId: input.candidate.releaseCandidateId, buildId: input.build.buildId, executionId: input.build.executionId, packageFingerprint: input.build.packageFingerprint, candidateHash: input.candidate.candidateHash, qualityEvidenceHash: input.build.qualityEvidenceHash, sourceRevision: input.build.sourceRevision, deploymentEngineVersion: DEPLOYMENT_ENGINE_VERSION }
  const requestHash = hash(body)
  return { deploymentId: 'deploy-' + requestHash.slice(0, 24), requestHash, body }
}
export function signDeploymentRequest(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex')
}
