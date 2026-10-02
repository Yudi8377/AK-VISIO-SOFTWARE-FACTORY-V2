import { createHash } from 'node:crypto'
import { createServerSupabaseAdminClient } from '@/lib/supabase-server'

export type AuditActorType = 'system' | 'user' | 'scheduler' | 'provider'

export type AuditEventInput = {
  ownerId: string
  organizationId: string
  environment: string
  eventType: string
  aggregateType: string
  aggregateId: string
  actorType: AuditActorType
  actorId?: string | null
  payload?: Record<string, unknown>
}

function stable(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value)) return '[' + value.map(stable).join(',') + ']'
  const record = value as Record<string, unknown>
  return '{' + Object.keys(record).sort().map((key) => JSON.stringify(key) + ':' + stable(record[key])).join(',') + '}'
}

function sha256(value: unknown): string {
  return createHash('sha256').update(stable(value)).digest('hex')
}

function safePayload(payload: Record<string, unknown> = {}) {
  const secretLike = /(secret|token|password|api[_-]?key|authorization|cookie|lease)/i
  return Object.fromEntries(Object.entries(payload).filter(([key]) => !secretLike.test(key)))
}

export function createAuditEvent(input: AuditEventInput, previousEventHash: string | null, occurredAt: string) {
  const payload = safePayload(input.payload)
  const payloadHash = sha256(payload)
  const eventHash = sha256({
    eventType: input.eventType,
    aggregateType: input.aggregateType,
    aggregateId: input.aggregateId,
    ownerId: input.ownerId,
    organizationId: input.organizationId,
    environment: input.environment,
    actorType: input.actorType,
    actorId: input.actorId ?? null,
    payloadHash,
    previousEventHash,
    occurredAt,
  })
  return {
    eventId: 'audit-' + eventHash.slice(0, 32),
    ownerId: input.ownerId,
    organizationId: input.organizationId,
    environment: input.environment,
    eventType: input.eventType,
    aggregateType: input.aggregateType,
    aggregateId: input.aggregateId,
    actorType: input.actorType,
    actorId: input.actorId ?? null,
    payload,
    payloadHash,
    previousEventHash,
    eventHash,
    occurredAt,
  }
}

export async function appendAuditEvent(input: AuditEventInput) {
  const supabase = createServerSupabaseAdminClient()
  const { data: previous } = await supabase
    .from('factory_audit_events')
    .select('event_hash')
    .eq('owner_id', input.ownerId)
    .eq('organization_id', input.organizationId)
    .eq('environment', input.environment)
    .order('occurred_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const occurredAt = new Date().toISOString()
  const event = createAuditEvent(input, previous?.event_hash ?? null, occurredAt)
  const { error } = await supabase.from('factory_audit_events').insert({
    event_id: event.eventId,
    owner_id: event.ownerId,
    organization_id: event.organizationId,
    environment: event.environment,
    event_type: event.eventType,
    aggregate_type: event.aggregateType,
    aggregate_id: event.aggregateId,
    actor_type: event.actorType,
    actor_id: event.actorId,
    payload: event.payload,
    payload_hash: event.payloadHash,
    previous_event_hash: event.previousEventHash,
    event_hash: event.eventHash,
    occurred_at: event.occurredAt,
  })
  if (error) {
    if (error.code === '23505') {
      const { data: existing } = await supabase.from('factory_audit_events')
        .select('event_id,event_hash')
        .eq('owner_id', input.ownerId).eq('event_id', event.eventId).maybeSingle()
      if (existing) return existing
    }
    throw error
  }
  return { eventId: event.eventId, eventHash: event.eventHash }
}

export function verifyAuditEventIntegrity(row: {
  event_id: string
  owner_id: string
  organization_id: string
  environment: string
  event_type: string
  aggregate_type: string
  aggregate_id: string
  actor_type: AuditActorType
  actor_id: string | null
  payload: Record<string, unknown>
  payload_hash: string
  previous_event_hash: string | null
  event_hash: string
  occurred_at: string
}) {
  const payloadHash = sha256(row.payload)
  if (payloadHash !== row.payload_hash) return false
  const expected = sha256({
    eventType: row.event_type,
    aggregateType: row.aggregate_type,
    aggregateId: row.aggregate_id,
    ownerId: row.owner_id,
    organizationId: row.organization_id,
    environment: row.environment,
    actorType: row.actor_type,
    actorId: row.actor_id,
    payloadHash,
    previousEventHash: row.previous_event_hash,
    occurredAt: row.occurred_at,
  })
  return expected === row.event_hash && row.event_id === 'audit-' + expected.slice(0, 32)
}
