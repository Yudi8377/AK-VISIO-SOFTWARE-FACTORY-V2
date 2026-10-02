import { NextResponse } from 'next/server'
import { executeGeneration } from '@/lib/enterprise/execution'
import { validateFactoryArtifacts } from '@/lib/enterprise/qa'
import { createReleaseCandidate } from '@/lib/enterprise/release'
import { persistQualityEvidence } from '@/lib/enterprise/quality-repository'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'authentication_required' }, { status: 401 })

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

  await persistQualityEvidence(user.id, String(body.organizationId), evidence)
  const candidate = createReleaseCandidate(result.executionId, result.artifacts, evidence)

  return NextResponse.json({ candidate, evidence }, { status: candidate.status === 'eligible' ? 200 : 422 })
}
