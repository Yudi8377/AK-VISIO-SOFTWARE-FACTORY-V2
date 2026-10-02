import { strict as assert } from 'node:assert'
import { executeGeneration } from './execution.ts'
import { validateFactoryArtifacts } from './qa.ts'
import { createReleaseCandidate, markBuildResult, assertReleaseEligible } from './release.ts'

const input = { prompt: 'Build enterprise travel software', organizationId: 'akvisio', requestedTargets: ['web'], risk: 'medium' as const }
const result = executeGeneration(input)
assert.equal(result.status, 'completed')

const evidence = validateFactoryArtifacts({ executionId: result.executionId, businessDna: result.plan.businessDna, artifacts: result.artifacts })
assert.equal(evidence.status, 'passed')

const candidate = createReleaseCandidate(result.executionId, result.artifacts, evidence)
assert.equal(candidate.status, 'eligible')
assert.equal(candidate.buildStatus, 'not-started')
assert.throws(() => assertReleaseEligible(candidate), /release_gate_failed/)

const built = markBuildResult(candidate, true)
assert.equal(built.buildStatus, 'passed')
assert.doesNotThrow(() => assertReleaseEligible(built))

const blocked = createReleaseCandidate(result.executionId, result.artifacts, { ...evidence, status: 'failed', releaseCandidateEligible: false })
assert.equal(blocked.status, 'blocked')
assert.throws(() => assertReleaseEligible(blocked), /release_candidate_blocked/)

console.log('Release candidate/build plane contract: PASS')
