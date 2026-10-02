import { strict as assert } from 'node:assert'
import { createReleaseGateDecision } from './release-gate.ts'

const base = { state: 'verified' as const, environment: 'production', providerReference: 'provider-1', verificationStatus: 'passed' as const, packageFingerprint: 'pkg-1', approvalPackageFingerprint: 'pkg-1', approvalEnvironment: 'production', approvalStatus: 'approved' as const }
assert.deepEqual(createReleaseGateDecision(base), { decision: 'eligible', reason: 'all_release_gates_passed' })
assert.equal(createReleaseGateDecision({ ...base, state: 'provider_accepted' }).decision, 'blocked')
assert.equal(createReleaseGateDecision({ ...base, verificationStatus: 'pending' }).decision, 'blocked')
assert.equal(createReleaseGateDecision({ ...base, approvalStatus: 'rejected' }).decision, 'blocked')
assert.equal(createReleaseGateDecision({ ...base, packageFingerprint: 'pkg-2' }).decision, 'blocked')
console.log('release gate tests passed')
