import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createServerSupabaseAdminClient } from '@/lib/supabase-server'
import { summarizeRecoveryIncidents, toRecoveryIncidentView, type RecoveryIncidentRow } from '@/lib/enterprise/recovery-observability'

export async function GET(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'authentication_required' }, { status: 401 })

  const url = new URL(request.url)
  const status = url.searchParams.get('status')
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || 50), 1), 100)

  const admin = createServerSupabaseAdminClient()
  let query = admin
    .from('factory_recovery_incidents')
    .select('id,incident_key,owner_id,organization_id,environment,current_deployment_id,target_deployment_id,status,attempt_count,max_attempts,cooldown_until,lease_until,last_recovery_id,last_error,detected_at,started_at,resolved_at,updated_at')
    .eq('owner_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(limit)

  if (status && ['detected', 'recovering', 'recovered', 'escalated', 'suppressed'].includes(status)) query = query.eq('status', status)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: 'recovery_incidents_unavailable' }, { status: 500 })

  const rows = (data ?? []) as RecoveryIncidentRow[]
  return NextResponse.json({
    incidents: rows.map(toRecoveryIncidentView),
    summary: summarizeRecoveryIncidents(rows),
    limit,
    generatedAt: new Date().toISOString(),
  })
}
