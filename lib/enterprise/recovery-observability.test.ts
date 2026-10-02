import assert from 'node:assert/strict'
import { summarizeRecoveryIncidents, toRecoveryIncidentView } from './recovery-observability'

const row = {
  id: '1',
  incident_key: 'incident-abc',
  owner_id: 'owner-1',
  organization_id: 'org-1',
  environment: 'production',
  current_deployment_id: 'deploy-current',
  target_deployment_id: 'deploy-target',
  status: 'recovering' as const,
  attempt_count: 1,
  max_attempts: 3,
  cooldown_until: null,
  lease_until: '2026-10-02T03:00:00Z',
  last_recovery_id: 'recovery-1',
  last_error: 'authorization=super-secret bearer abc123 provider failed',
  detected_at: '2026-10-02T02:00:00Z',
  started_at: '2026-10-02T02:01:00Z',
  resolved_at: null,
  updated_at: '2026-10-02T02:01:00Z',
}

const view = toRecoveryIncidentView(row)
assert.equal(view.organizationId, 'org-1')
assert.equal(view.status, 'recovering')
assert.equal('ownerId' in view, false)
assert.equal('leaseToken' in view, false)
assert.match(String(view.lastError), /\[REDACTED\]/)

const summary = summarizeRecoveryIncidents([
  row,
  { ...row, id: '2', status: 'recovered', last_error: null },
  { ...row, id: '3', status: 'suppressed', last_error: null },
])
assert.deepEqual(summary, { total: 3, detected: 0, recovering: 1, recovered: 1, escalated: 0, suppressed: 1 })

console.log('recovery observability tests passed')
