import type {
  ApprovalState,
  AutomationMode,
  PublishJobState,
  ProviderReadiness,
} from './safety'
import { evaluatePublishPolicy } from './safety'

export type RuntimeActor = {
  userId: string
  authenticated: boolean
}

export type RuntimePublishRequest = {
  actor: RuntimeActor
  ownerId: string
  mode: AutomationMode
  approval: ApprovalState
  provider: ProviderReadiness
  jobState: PublishJobState
  idempotencyKey: string
}

export type RuntimeDecision = {
  allowed: boolean
  reason: string
}

export function authorizeRuntimePublish(input: RuntimePublishRequest): RuntimeDecision {
  if (!input.actor.authenticated) {
    return { allowed: false, reason: 'authentication_required' }
  }

  if (!input.actor.userId.trim()) {
    return { allowed: false, reason: 'missing_actor_identity' }
  }

  if (!input.ownerId.trim() || input.actor.userId !== input.ownerId) {
    return { allowed: false, reason: 'owner_mismatch' }
  }

  if (input.jobState !== 'QUEUED') {
    return { allowed: false, reason: 'job_not_queued' }
  }

  return evaluatePublishPolicy({
    mode: input.mode,
    approval: input.approval,
    provider: input.provider,
    idempotencyKey: input.idempotencyKey,
  })
}

export function canTransitionPublishJob(
  from: PublishJobState,
  to: PublishJobState,
): boolean {
  const transitions: Record<PublishJobState, PublishJobState[]> = {
    QUEUED: ['RUNNING', 'CANCELLED'],
    RUNNING: ['SUCCEEDED', 'FAILED', 'CANCELLED'],
    SUCCEEDED: [],
    FAILED: ['QUEUED', 'CANCELLED'],
    CANCELLED: [],
  }

  return transitions[from].includes(to)
}

export function canMarkProviderVerified(
  state: PublishJobState,
  providerStatus: ProviderReadiness,
): boolean {
  return state === 'SUCCEEDED' && providerStatus.configured && providerStatus.ready
}

export function normalizeIdempotencyKey(value: string): string {
  return value.trim().replace(/\\s+/g, ' ')
}

export function buildRuntimeStatus() {
  return {
    runtime: 'DIGITAL_PRESENCE',
    executionEnabled: false,
    externalPublishingEnabled: false,
    serpResearchEnabled: false,
    accountCreationEnabled: false,
    failClosed: true,
  } as const
}
