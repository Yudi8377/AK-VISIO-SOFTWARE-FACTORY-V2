import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.116.0'

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8' },
})

function normalizeKey(value: string) {
  return value.trim().replace(/\s+/g, ' ')
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  const authHeader = req.headers.get('authorization') ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''
  if (!token) return json({ error: 'authentication_required' }, 401)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  if (!supabaseUrl || !anonKey) return json({ error: 'runtime_configuration_missing' }, 503)

  const supabase = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  })

  const { data: userData, error: userError } = await supabase.auth.getUser(token)
  if (userError || !userData.user) return json({ error: 'authentication_required' }, 401)

  let body: { jobId?: string; idempotencyKey?: string }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }

  const jobId = typeof body.jobId === 'string' ? body.jobId.trim() : ''
  const idempotencyKey = typeof body.idempotencyKey === 'string' ? normalizeKey(body.idempotencyKey) : ''
  if (!jobId || !idempotencyKey) return json({ error: 'job_id_and_idempotency_key_required' }, 400)

  const { data: job, error: jobError } = await supabase
    .from('social_publish_jobs')
    .select('id, owner_id, content_id, connection_id, mode, status, approval_state, idempotency_key, provider_status, verified_at')
    .eq('id', jobId)
    .eq('owner_id', userData.user.id)
    .maybeSingle()

  if (jobError) return json({ error: 'job_lookup_failed' }, 500)
  if (!job) return json({ error: 'job_not_found' }, 404)
  if (job.status !== 'queued') return json({ error: 'job_not_queued', status: job.status }, 409)
  if (job.approval_state !== 'approved') return json({ error: 'approval_required' }, 409)
  if (!job.idempotency_key) return json({ error: 'idempotency_key_not_registered' }, 409)
  if (job.idempotency_key !== idempotencyKey) return json({ error: 'idempotency_key_mismatch' }, 409)

  const { data: connection, error: connectionError } = job.connection_id
    ? await supabase
      .from('social_connections')
      .select('id, provider, status, external_asset_id, scopes, token_expires_at, last_verified_at, metadata')
      .eq('id', job.connection_id)
      .eq('owner_id', userData.user.id)
      .maybeSingle()
    : { data: null, error: null }

  if (connectionError) return json({ error: 'connection_lookup_failed' }, 500)
  if (!connection || connection.status !== 'connected' || !connection.last_verified_at) {
    return json({ error: 'provider_not_ready', reason: 'connection_not_verified' }, 409)
  }

  return json({
    error: 'provider_secret_binding_required',
    provider: connection.provider,
    executionEnabled: false,
    failClosed: true,
    nextGate: 'secure_server_side_oauth_secret_binding',
  }, 409)
})
