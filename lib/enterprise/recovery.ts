import { createHash, timingSafeEqual } from 'node:crypto'

export const RECOVERY_ENGINE_VERSION = '1.0.0'
export type RecoveryDecision = 'eligible' | 'blocked'

function stable(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value)) return '[' + value.map(stable).join(',') + ']'
  const record = value as Record<string, unknown>
  return '{' + Object.keys(record).sort().map((key) => JSON.stringify(key) + ':' + stable(record[key])).join(',') + '}'
}

function hash(value: unknown): string {
  return createHash('sha256').update(stable(value)).digest('hex')
}

export function assertTrustedRecoveryInvocation(secret: string | undefined, presented: string | null): void {
  if (!secret || !presented || presented.length !== secret.length) throw new Error('trusted_recovery_secret_required')
  const expected = Buffer.from(secret)
  const actual = Buffer.from(presented)
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    throw new Error('trusted_recovery_secret_invalid')
  }
}

export function createRecoveryExecution(input: {
  currentDeploymentId: string
  targetDeploymentId: string
  organizationId: string
  environment: string
  provider: string
  decisionId: string
  evidenceHash: string
}) {
  const payload = {
    currentDeploymentId: input.currentDeploymentId,
    targetDeploymentId: input.targetDeploymentId,
    organizationId: input.organizationId,
    environment: input.environment,
    provider: input.provider,
    decisionId: input.decisionId,
    evidenceHash: input.evidenceHash,
    recoveryEngineVersion: RECOVERY_ENGINE_VERSION,
  }
  const requestHash = hash(payload)
  return {
    recoveryId: 'recovery-exec-' + requestHash.slice(0, 24),
    requestHash,
    payload,
  }
}
