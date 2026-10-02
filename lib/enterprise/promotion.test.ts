import assert from 'node:assert/strict'
import { createPromotionDecision } from './promotion.ts'
import type { DeploymentEvidence } from './deployment.ts'

const evidence: DeploymentEvidence = {
  deploymentId: 'deploy-1', approvalId: 'approval-1', releaseCandidateId: 'rc-1', buildId: 'build-1',
  executionId: 'exec-1', organizationId: 'org-1', ownerId: 'owner-1', environment: 'staging',
  action: 'deploy', status: 'succeeded', provider: 'webhook', providerReference: 'provider-1',
  packageFingerprint: 'fingerprint-1', requestHash: 'request-1', deploymentEngineVersion: '1.0.0',
  startedAt: '2026-10-02T00:00:00.000Z', completedAt: '2026-10-02T00:01:00.000Z',\n  verificationStatus: 'passed', verificationReference: 'verify-1', verifiedAt: '2026-10-02T00:01:30.000Z',
}
const result = createPromotionDecision(evidence, 'staging', 'staging')
assert.equal(result.decision, 'promote')
assert.throws(() => createPromotionDecision({ ...evidence, status: 'failed' }, 'staging', 'staging'), /promotion_requires_successful_deployment/)
assert.throws(() => createPromotionDecision({ ...evidence, environment: 'development' }, 'staging', 'staging'), /promotion_environment_mismatch/)
console.log('promotion tests passed')
