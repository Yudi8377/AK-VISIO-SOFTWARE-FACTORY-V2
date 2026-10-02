import { strict as assert } from 'node:assert'
import { executeGeneration } from './execution.ts'
import { validateFactoryArtifacts } from './qa.ts'
import { createReleaseCandidate } from './release.ts'
import { executeBuild } from './build.ts'

const result = executeGeneration({
  prompt: 'Build enterprise travel software',
  organizationId: 'akvisio',
  requestedTargets: ['web'],
  risk: 'medium',
})
assert.equal(result.status, 'completed')

const evidence = validateFactoryArtifacts({
  executionId: result.executionId,
  businessDna: result.plan.businessDna,
  artifacts: result.artifacts,
})
assert.equal(evidence.status, 'passed')

const candidate = createReleaseCandidate(result.executionId, result.artifacts, evidence)
assert.equal(candidate.status, 'eligible')

const tamperedCandidate = { ...candidate, candidateHash: '0'.repeat(64) }
assert.throws(() => executeBuild({ candidate: tamperedCandidate, artifactHashes: result.artifacts.map(a => ({ artifactId: a.artifactId, contentHash: a.contentHash })), qualityEvidenceHash: evidence.evidenceHash, sourceRevision: 'test-revision' }), /release_candidate_integrity_failed/)

const artifactHashes = result.artifacts.map(a => ({ artifactId: a.artifactId, contentHash: a.contentHash }))
const build = executeBuild({
  candidate,
  artifactHashes,
  qualityEvidenceHash: evidence.evidenceHash,
  sourceRevision: 'test-revision',
})
assert.equal(build.status, 'passed')
assert.equal(build.artifactIds.length, result.artifacts.length)
assert.match(build.packageFingerprint, /^[a-f0-9]{64}$/)

assert.throws(() => executeBuild({
  candidate,
  artifactHashes,
  qualityEvidenceHash: 'tampered',
  sourceRevision: 'test-revision',
}), /build_quality_evidence_mismatch/)

assert.throws(() => executeBuild({
  candidate,
  artifactHashes: artifactHashes.slice(1),
  qualityEvidenceHash: evidence.evidenceHash,
  sourceRevision: 'test-revision',
}), /build_artifact_integrity_failed/)

const blocked = createReleaseCandidate(result.executionId, result.artifacts, { ...evidence, status: 'failed', releaseCandidateEligible: false })
assert.throws(() => executeBuild({
  candidate: blocked,
  artifactHashes,
  qualityEvidenceHash: evidence.evidenceHash,
  sourceRevision: 'test-revision',
}), /build_candidate_blocked/)

console.log('Build execution plane contract: PASS')
