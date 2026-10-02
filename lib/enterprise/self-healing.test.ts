import assert from 'node:assert/strict'
import { createRecoveryIncidentKey, createRecoveryIncidentHash, createRecoveryAttemptId, recoveryPolicy, nextRecoveryWindow } from './self-healing.ts'
const input={ownerId:'owner',organizationId:'org',environment:'production',currentDeploymentId:'current',targetDeploymentId:'target'}
const key=createRecoveryIncidentKey(input)
assert.equal(key,createRecoveryIncidentKey(input))
assert.notEqual(key,createRecoveryIncidentKey({...input,targetDeploymentId:'other'}))
assert.equal(createRecoveryIncidentHash({incidentKey:key,currentDeploymentId:'current',targetDeploymentId:'target',healthEvidenceHash:'h'}).length,64)
assert.equal(createRecoveryAttemptId(key,1),createRecoveryAttemptId(key,1))
const now=new Date('2026-10-02T00:00:00.000Z')
assert.equal(recoveryPolicy({attemptCount:3,maxAttempts:3,now}).status,'escalated')
assert.equal(recoveryPolicy({attemptCount:1,maxAttempts:3,now,cooldownUntil:'2026-10-02T00:10:00.000Z'}).status,'suppressed')
assert.equal(recoveryPolicy({attemptCount:1,maxAttempts:3,now,leaseUntil:'2026-10-02T00:10:00.000Z'}).status,'recovering')
assert.equal(recoveryPolicy({attemptCount:1,maxAttempts:3,now}).allowed,true)
assert.equal(nextRecoveryWindow(now,1800),'2026-10-02T00:30:00.000Z')
console.log('self-healing tests passed')
