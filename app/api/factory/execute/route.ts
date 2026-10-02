import { NextResponse } from 'next/server'
import { executeGeneration } from '@/lib/enterprise/execution'
import { persistFactoryExecution } from '@/lib/enterprise/artifact-repository'
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
    return NextResponse.json(result, { status: 403 })
  }

  try {
    await persistFactoryExecution(
      user.id,
      String(body.organizationId),
      result.executionId,
      String(body.prompt),
      result.artifacts,
    )
  } catch (error) {
    return NextResponse.json({
      error: 'artifact_persistence_failed',
      detail: error instanceof Error ? error.message : 'unknown_error',
      executionId: result.executionId,
    }, { status: 500 })
  }

  return NextResponse.json(result, { status: 201 })
}
