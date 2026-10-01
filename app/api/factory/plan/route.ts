import { NextResponse } from 'next/server'
import { planGeneration } from '@/lib/enterprise/runtime'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body?.prompt || !body?.organizationId) {
    return NextResponse.json({ error: 'prompt and organizationId are required' }, { status: 400 })
  }

  const plan = planGeneration({
    prompt: String(body.prompt),
    organizationId: String(body.organizationId),
    requestedTargets: Array.isArray(body.requestedTargets) ? body.requestedTargets.map(String) : undefined,
    risk: body.risk === 'low' || body.risk === 'high' || body.risk === 'critical' ? body.risk : 'medium',
  })

  return NextResponse.json(plan)
}
