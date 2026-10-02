import { NextResponse } from 'next/server'
import { executeGeneration } from '@/lib/enterprise/execution'
import { validateFactoryArtifacts } from '@/lib/enterprise/qa'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'authentication_required' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (!body?.prompt || !body?.organizationId) {
    return NextResponse.json({ error: 'prompt and organizationId are required' }, { status: 400 })
  }

  const result = executeGeneration({
    prompt: String(body.prompt),
    organizationId: String(body.organizationId),
    requestedTargets: Array.isArray(body.requestedTargets) ? body.requestedTargets.map(String) : undefined,
    risk: body.risk === 'low' || body.risk === 'high' || body.risk === 'critical' ? body.risk : 'medium',
  })

  if (result.status === 'blocked') {
    return NextResponse.json({ error: 'generation_blocked', executionId: result.executionId, policy: result.policy }, { status: 403 })
  }

  const evidence = validateFactoryArtifacts({
    executionId: result.executionId,
    businessDna: result.plan.businessDna,
    artifacts: result.artifacts,
  })

  return NextResponse.json({ executionId: result.executionId, evidence }, { status: evidence.status === 'passed' ? 200 : 422 })
}
