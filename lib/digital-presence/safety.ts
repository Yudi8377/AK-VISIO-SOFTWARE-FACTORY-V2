export type AutomationMode = 'AUTO' | 'SEMI_AUTO' | 'MANUAL'

export type ApprovalState = 'PENDING' | 'APPROVED' | 'REJECTED'

export type PublishJobState = 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED'

export type ProviderReadiness = {
  configured: boolean
  ready: boolean
  reasons: string[]
}

export type PublishPolicyInput = {
  mode: AutomationMode
  approval: ApprovalState
  provider: ProviderReadiness
  idempotencyKey: string
}

export type PublishPolicyDecision = {
  allowed: boolean
  reason: string
}

export function evaluatePublishPolicy(input: PublishPolicyInput): PublishPolicyDecision {
  if (!input.idempotencyKey.trim()) {
    return { allowed: false, reason: 'missing_idempotency_key' }
  }

  if (!input.provider.configured || !input.provider.ready) {
    return { allowed: false, reason: 'provider_not_ready' }
  }

  if (input.mode === 'MANUAL') {
    return { allowed: false, reason: 'manual_mode_requires_operator_action' }
  }

  if (input.approval !== 'APPROVED') {
    return { allowed: false, reason: 'approval_required' }
  }

  return { allowed: true, reason: 'publish_allowed' }
}

export function buildIdempotencyKey(parts: string[]): string {
  return parts.map((part) => part.trim()).filter(Boolean).join(':')
}

export function calculateRetryDelayMs(
  attempt: number,
  baseMs = 1000,
  maxMs = 30000,
  jitterRatio = 0.1,
  jitterFactor = 0.5,
): number {
  const normalizedAttempt = Math.max(0, Math.floor(attempt))
  const normalizedJitter = Math.min(1, Math.max(0, jitterRatio))
  const normalizedFactor = Math.min(1, Math.max(0, jitterFactor))
  const exponential = Math.min(maxMs, baseMs * 2 ** normalizedAttempt)
  return Math.round(exponential * (1 + (normalizedFactor * 2 - 1) * normalizedJitter))
}

export function isRetryablePublishFailure(statusCode?: number): boolean {
  if (!statusCode) return true
  return statusCode === 408 || statusCode === 425 || statusCode === 429 || statusCode >= 500
}

export function redactSecret(value: string | undefined): string | undefined {
  if (!value) return undefined
  if (value.length <= 8) return '***'
  return `${value.slice(0, 4)}***${value.slice(-4)}`
}

export function canVerifyPublishedResult(state: PublishJobState): boolean {
  return state === 'SUCCEEDED'
}
