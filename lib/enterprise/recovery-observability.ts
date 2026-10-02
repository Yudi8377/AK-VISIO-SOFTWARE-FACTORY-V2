export type RecoveryIncidentRow = {
  id: string
  incident_key: string
  owner_id: string
  organization_id: string
  environment: string
  current_deployment_id: string
  target_deployment_id: string
  status: 'detected' | 'recovering' | 'recovered' | 'escalated' | 'suppressed'
  attempt_count: number
  max_attempts: number
  cooldown_until: string | null
  lease_until: string | null
  last_recovery_id: string | null
  last_error: string | null
  detected_at: string
  started_at: string | null
  resolved_at: string | null
  updated_at: string
}

const SECRET_PATTERNS = [
  /(bearer\s+)[^\s,;]+/gi,
  /((?:secret|token|password|api[_-]?key|authorization)[=:]\s*)[^\s,;]+/gi,
]

export function sanitizeRecoveryError(value: unknown) {
  if (typeof value !== 'string') return null
  return SECRET_PATTERNS.reduce((result, pattern) => result.replace(pattern, '$1[REDACTED]'), value).slice(0, 500)
}

export function toRecoveryIncidentView(row: RecoveryIncidentRow) {
  return {
    id: row.id,
    incidentKey: row.incident_key,
    organizationId: row.organization_id,
    environment: row.environment,
    currentDeploymentId: row.current_deployment_id,
    targetDeploymentId: row.target_deployment_id,
    status: row.status,
    attemptCount: row.attempt_count,
    maxAttempts: row.max_attempts,
    cooldownUntil: row.cooldown_until,
    leaseUntil: row.lease_until,
    lastRecoveryId: row.last_recovery_id,
    lastError: sanitizeRecoveryError(row.last_error),
    detectedAt: row.detected_at,
    startedAt: row.started_at,
    resolvedAt: row.resolved_at,
    updatedAt: row.updated_at,
  }
}

export function summarizeRecoveryIncidents(rows: RecoveryIncidentRow[]) {
  return rows.reduce((summary, row) => {
    summary.total += 1
    summary[row.status] += 1
    return summary
  }, {
    total: 0,
    detected: 0,
    recovering: 0,
    recovered: 0,
    escalated: 0,
    suppressed: 0,
  } as {
    total: number
    detected: number
    recovering: number
    recovered: number
    escalated: number
    suppressed: number
  })
}
