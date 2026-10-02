import assert from 'node:assert/strict'
import { createReleaseApproval, assertDeploymentEligible, createDeploymentRequest } from './deployment.ts'
import { createReleaseCandidate } from './release.ts'
import { executeBuild } from './build.ts'
import { validateFactoryArtifacts } from './qa.ts'
import { executeGeneration } from './execution.ts'

const generated = executeGeneration({ prompt: 'deployment test', organizationId: 'akvisio', risk: 'medium' })
assert.equal(generated.status, 'completed')
const evidence = validateFactoryArtifacts({ executionId: generated.executionId, businessDna: generated.plan.businessDna, artifacts: generated.artifacts })
const candidate = createReleaseCandidate(generated.executionId, generated.artifacts, evidence)
const build = executeBuild({ candidate, artifactHashes: generated.artifacts.map(a => ({ artifactId: a.artifactId, contentHash: a.contentHash })), qualityEvidenceHash: evidence.evidenceHash, sourceRevision: 'test-revision' })
const approval = createReleaseApproval({
  releaseCandidateId: candidate.releaseCandidateId, buildId: build.buildId, executionId: build.executionId,
  organizationId: 'akvisio', ownerId: 'owner-1', environment: 'production',
  packageFingerprint: build.packageFingerprint, approvedBy: 'control-plane', status: 'approved',
})
assert.doesNotThrow(() => assertDeploymentEligible(candidate, build, approval, 'production'))
const request = createDeploymentRequest({ candidate, build, approval, environment: 'production', action: 'deploy', provider: 'webhook' })
assert.equal(request.deploymentId.startsWith('deploy-'), true)
assert.equal(request.requestHash.length, 64)
assert.throws(() => assertDeploymentEligible(candidate, build, { ...approval, packageFingerprint: 'tampered' }, 'production'), /release_approval/)
assert.throws(() => assertDeploymentEligible(candidate, build, approval, 'staging'), /environment/)
assert.throws(() => assertDeploymentEligible(candidate, { ...build, packageFingerprint: 'tampered' }, approval, 'production'), /fingerprint/)
console.log('deployment tests passed')
