import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createServerSupabaseAdminClient } from '@/lib/supabase-server'
import { verifyAuditEventIntegrity, type AuditActorType } from '@/lib/enterprise/audit-ledger'

const ACTOR_TYPES = new Set<AuditActorType>(['system', 'user', 'scheduler', 'provider'])

export async function GET(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'authentication_required' }, { status: 401 })

  const url = new URL(request.url)
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || 100), 1), 200)
  const aggregateType = url.searchParams.get('aggregateType')
  const aggregateId = url.searchParams.get('aggregateId')

  const admin = createServerSupabaseAdminClient()
  let query = admin.from('factory_audit_events')
    .select('event_id,owner_id,organization_id,environment,event_type,aggregate_type,aggregate_id,actor_type,actor_id,payload,payload_hash,previous_event_hash,event_hash,occurred_at')
    .eq('owner_id', user.id)
    .order('occurred_at', { ascending: false })
    .limit(limit)

  if (aggregateType) query = query.eq('aggregate_type', aggregateType)
  if (aggregateId) query = query.eq('aggregate_id', aggregateId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: 'audit_events_unavailable' }, { status: 500 })

  const events = (data ?? []).map((row) => ({
    ...row,
    integrityValid: ACTOR_TYPES.has(row.actor_type as AuditActorType) && verifyAuditEventIntegrity(row as never),
  }))
  return NextResponse.json({
    events,
    integrity: {
      checked: events.length,
      invalid: events.filter((event) => !event.integrityValid).length,
    },
    generatedAt: new Date().toISOString(),
  })
}
