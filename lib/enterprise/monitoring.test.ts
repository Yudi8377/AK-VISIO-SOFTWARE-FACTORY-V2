import assert from 'node:assert/strict'
import { assessDeploymentHealth, assertAutonomousRecoveryEligible } from './monitoring.ts'
import type { DeploymentEvidence } from './deployment.ts'
const base:DeploymentEvidence={deploymentId:'deploy-current',approvalId:'approval-1',releaseCandidateId:'rc-1',buildId:'build-1',executionId:'exec-1',organizationId:'org-1',ownerId:'owner-1',environment:'production',action:'deploy',status:'succeeded',provider:'webhook',providerReference:'provider-1',packageFingerprint:'fp-1',requestHash:'hash-1',deploymentEngineVersion:'1.0.0',startedAt:'2026-10-02T00:00:00.000Z',completedAt:'2026-10-02T00:01:00.000Z',verificationStatus:'passed',verificationReference:'verify-1',verifiedAt:'2026-10-02T00:02:00.000Z'}
const target={...base,deploymentId:'deploy-target',packageFingerprint:'fp-0',providerReference:'provider-0'}
assert.equal(assessDeploymentHealth({evidence:base,state:'verified',checkedAt:'2026-10-02T00:02:00.000Z',maxAgeSeconds:3600}).health,'healthy')
assert.equal(assessDeploymentHealth({evidence:base,state:'verified',checkedAt:'2026-10-02T02:00:00.000Z',maxAgeSeconds:3600}).health,'unhealthy')
assert.throws(()=>assertAutonomousRecoveryEligible({current:base,currentState:'verified',target,targetState:'requested',health:'unhealthy'}),/recovery_target_not_verified/)
assert.doesNotThrow(()=>assertAutonomousRecoveryEligible({current:base,currentState:'verified',target,targetState:'verified',health:'unhealthy'}))
assert.throws(()=>assertAutonomousRecoveryEligible({current:base,currentState:'verified',target:{...target,organizationId:'other'},targetState:'verified',health:'unhealthy'}),/recovery_scope_mismatch/)
console.log('monitoring tests passed')
