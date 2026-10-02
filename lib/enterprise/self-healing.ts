import { createHash, randomUUID } from 'node:crypto'

export const SELF_HEALING_ENGINE_VERSION = '1.0.0'
export const DEFAULT_MAX_RECOVERY_ATTEMPTS = 3
export const DEFAULT_COOLDOWN_SECONDS = 30 * 60
export const DEFAULT_LEASE_SECONDS = 5 * 60
const hash = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex')

export function createRecoveryIncidentKey(input:{ownerId:string;organizationId:string;environment:string;currentDeploymentId:string;targetDeploymentId:string}) {
  return 'incident-' + hash(input).slice(0, 32)
}
export function createRecoveryIncidentHash(input:{incidentKey:string;currentDeploymentId:string;targetDeploymentId:string;healthEvidenceHash:string}) {
  return hash({ ...input, engine: SELF_HEALING_ENGINE_VERSION })
}
export function createRecoveryAttemptId(incidentKey:string, attempt:number) {
  return 'recovery-attempt-' + hash({ incidentKey, attempt }).slice(0, 24)
}
export function recoveryPolicy(input:{attemptCount:number;maxAttempts:number;now:Date;cooldownUntil?:string|null;leaseUntil?:string|null}) {
  if (input.attemptCount >= input.maxAttempts) return { allowed:false as const, status:'escalated' as const, reason:'max_recovery_attempts_exceeded' }
  if (input.leaseUntil && Date.parse(input.leaseUntil) > input.now.getTime()) return { allowed:false as const, status:'recovering' as const, reason:'recovery_lease_active' }
  if (input.cooldownUntil && Date.parse(input.cooldownUntil) > input.now.getTime()) return { allowed:false as const, status:'suppressed' as const, reason:'recovery_cooldown_active' }
  return { allowed:true as const, status:'recovering' as const, reason:'recovery_attempt_allowed' }
}
export function nextRecoveryWindow(now:Date,cooldownSeconds=DEFAULT_COOLDOWN_SECONDS){ return new Date(now.getTime()+cooldownSeconds*1000).toISOString() }
export function newLeaseToken(){ return randomUUID() }
