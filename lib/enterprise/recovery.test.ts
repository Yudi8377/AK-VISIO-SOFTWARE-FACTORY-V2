import { assertTrustedRecoveryInvocation, createRecoveryExecution } from './recovery.ts'

function expectThrow(fn: () => void, message: string) {
  try { fn(); throw new Error('expected_throw:' + message) } catch (error) {
    if (error instanceof Error && error.message === 'expected_throw:' + message) throw error
  }
}

expectThrow(() => assertTrustedRecoveryInvocation(undefined, 'x'), 'missing_secret')
expectThrow(() => assertTrustedRecoveryInvocation('secret', null), 'missing_presented')
expectThrow(() => assertTrustedRecoveryInvocation('secret', 'wrong!'), 'invalid_secret')
assertTrustedRecoveryInvocation('secret', 'secret')

const execution = createRecoveryExecution({
  currentDeploymentId: 'current',
  targetDeploymentId: 'target',
  organizationId: 'org',
  environment: 'production',
  provider: 'webhook',
  decisionId: 'decision-1',
  evidenceHash: 'evidence-1',
})
if (!execution.recoveryId.startsWith('recovery-exec-')) throw new Error('recovery_id_missing')
if (execution.requestHash.length !== 64) throw new Error('recovery_hash_invalid')
console.log('recovery tests passed')
