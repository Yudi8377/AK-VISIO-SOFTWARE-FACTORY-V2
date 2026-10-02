import { strict as assert } from 'node:assert'
import { assertDeploymentTransition, assertVerifiedDeployment } from './deployment-state.ts'

assert.equal(assertDeploymentTransition('requested', 'provider_accept'), 'provider_accepted')
assert.equal(assertDeploymentTransition('provider_accepted', 'verify'), 'verified')
assert.equal(assertDeploymentTransition('verified', 'promote'), 'promoted')
assert.throws(() => assertDeploymentTransition('requested', 'promote'), /invalid_deployment_transition/)
assert.throws(() => assertVerifiedDeployment({ state: 'provider_accepted', verificationStatus: 'passed', providerReference: 'x' }), /deployment_verification_required/)
assert.throws(() => assertVerifiedDeployment({ state: 'verified', verificationStatus: 'pending', providerReference: 'x' }), /deployment_verification_required/)
assert.doesNotThrow(() => assertVerifiedDeployment({ state: 'verified', verificationStatus: 'passed', providerReference: 'provider-1' }))
console.log('deployment state tests passed')
