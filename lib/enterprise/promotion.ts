import { createHash } from 'node:crypto'
import type { DeploymentEvidence } from './deployment.ts'

export type PromotionStage = 'staging' | 'production'
export type PromotionDecision = 'promote' | 'blocked'

function hash(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex')
}

export function assertPromotionEligible(evidence: DeploymentEvidence, target: PromotionStage, expectedEnvironment: string): void {
  if (evidence.action !== 'deploy' || evidence.status !== 'succeeded') throw new Error('promotion_requires_successful_deployment')
  if (evidence.environment !== expectedEnvironment) throw new Error('promotion_environment_mismatch')
  if (target === 'production' && evidence.providerReference === 'unavailable') throw new Error('promotion_provider_reference_missing')
}

export function createPromotionDecision(evidence: DeploymentEvidence, target: PromotionStage, expectedEnvironment: string) {
  assertPromotionEligible(evidence, target, expectedEnvironment)
  const evidenceHash = hash(evidence)
  return { decisionId: 'promotion-' + hash({ evidenceHash, target }).slice(0, 24), decision: 'promote' as const, evidenceHash }
}
