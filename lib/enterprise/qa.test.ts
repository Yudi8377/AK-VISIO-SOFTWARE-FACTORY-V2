import { strict as assert } from 'node:assert'
import { createBusinessDNA } from './runtime.ts'
import { executeGeneration } from './execution.ts'
import { validateFactoryArtifacts, assertReleaseCandidateEligible } from './qa.ts'

const input = {
  prompt: 'Build an enterprise travel platform',
  organizationId: 'akvisio',
  requestedTargets: ['web'],
  risk: 'medium' as const,
}
const result = executeGeneration(input)
assert.equal(result.status, 'completed')

const evidence = validateFactoryArtifacts({
  executionId: result.executionId,
  businessDna: createBusinessDNA(input),
  artifacts: result.artifacts,
})
assert.equal(evidence.status, 'passed')
assert.equal(evidence.releaseCandidateEligible, true)
assert.equal(evidence.findings.length, 0)
assert.equal(evidence.evidenceHash.length, 64)
assert.doesNotThrow(() => assertReleaseCandidateEligible(evidence))

const tampered = structuredClone(result.artifacts)
tampered[0].content = { tampered: true }
const failed = validateFactoryArtifacts({
  executionId: result.executionId,
  businessDna: createBusinessDNA(input),
  artifacts: tampered,
})
assert.equal(failed.status, 'failed')
assert.equal(failed.releaseCandidateEligible, false)
assert.ok(failed.findings.some(f => f.code === 'CONTENT_HASH_MISMATCH'))
assert.throws(() => assertReleaseCandidateEligible(failed), /quality_gate_failed/)

console.log('QA/Security execution plane contract: PASS')
