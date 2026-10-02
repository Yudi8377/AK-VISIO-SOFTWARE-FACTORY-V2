import { createAuditEvent, verifyAuditEventIntegrity } from './audit-ledger.ts'

const first = createAuditEvent({
  ownerId: 'owner-1',
  organizationId: 'org-1',
  environment: 'production',
  eventType: 'deployment.requested',
  aggregateType: 'deployment',
  aggregateId: 'deploy-1',
  actorType: 'system',
  payload: { packageFingerprint: 'abc', authorization: 'do-not-store' },
}, null, '2026-10-02T00:00:00.000Z')

if (first.eventId !== 'audit-' + first.eventHash.slice(0, 32)) throw new Error('deterministic event id failed')
if ('authorization' in first.payload) throw new Error('secret-like payload key was retained')

const row = {
  event_id: first.eventId,
  owner_id: first.ownerId,
  organization_id: first.organizationId,
  environment: first.environment,
  event_type: first.eventType,
  aggregate_type: first.aggregateType,
  aggregate_id: first.aggregateId,
  actor_type: first.actorType,
  actor_id: first.actorId,
  payload: first.payload,
  payload_hash: first.payloadHash,
  previous_event_hash: first.previousEventHash,
  event_hash: first.eventHash,
  occurred_at: first.occurredAt,
}
if (!verifyAuditEventIntegrity(row)) throw new Error('integrity verification failed')
if (verifyAuditEventIntegrity({ ...row, payload: { tampered: true } })) throw new Error('tamper detection failed')
console.log('audit-ledger tests passed')
