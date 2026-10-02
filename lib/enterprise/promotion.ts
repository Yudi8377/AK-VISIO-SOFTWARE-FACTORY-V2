import { createHash } from 'node:crypto'
import type { DeploymentEvidence } from './deployment.ts'

export type PromotionStage = 'staging' | 'production'
export type PromotionDecision = 'promote' | 'blocked'

function hash(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex')
}

export function assertPromotionEligible(
  evidence: DeploymentEvidence,
  target: PromotionStage,
  expectedEnvironment: string,
  deploymentState: string,
  approval?: { packageFingerprint: string; environment: string; status: 'approved' | 'rejected' },
): void {
  if (evidence.action !== 'deploy' || evidence.status !== 'succeeded') throw new Error('promotion_requires_successful_deployment')
  if (evidence.environment !== expectedEnvironment) throw new Error('promotion_environment_mismatch')
  if (deploymentState !== 'verified' || evidence.verificationStatus !== 'passed') throw new Error('promotion_requires_verified_deployment')
  if (target === 'production') {
    if (!approval || approval.status !== 'approved' || approval.packageFingerprint !== evidence.packageFingerprint || approval.environment !== evidence.environment) {
      throw new Error('promotion_production_approval_required')
    }
  }
  if (target === 'production' && evidence.providerReference === 'unavailable') throw new Error('promotion_provider_reference_missing')
}

export function createPromotionDecision(
  evidence: DeploymentEvidence,
  target: PromotionStage,
  expectedEnvironment: string,
  deploymentState = 'verified',
  approval?: { packageFingerprint: string; environment: string; status: 'approved' | 'rejected' },
) {
  assertPromotionEligible(evidence, target, expectedEnvironment, deploymentState, approval)
  const evidenceHash = hash(evidence)
  return { decisionId: 'promotion-' + hash({ evidenceHash, target }).slice(0, 24), decision: 'promote' as const, evidenceHash }
}
