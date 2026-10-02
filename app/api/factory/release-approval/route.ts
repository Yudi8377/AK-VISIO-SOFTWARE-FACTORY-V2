import { NextResponse } from 'next/server'
import { createReleaseApproval } from '@/lib/enterprise/deployment'
import { getOwnedReleasePackage, persistReleaseApproval } from '@/lib/enterprise/release-deployment-repository'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
  const configured = process.env.CONTROL_PLANE_APPROVAL_SECRET
  if (!configured) return NextResponse.json({ error: 'control_plane_approval_not_configured' }, { status: 503 })
  if (request.headers.get('x-control-plane-approval-secret') !== configured) return NextResponse.json({ error: 'trusted_control_plane_required' }, { status: 403 })
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'authentication_required' }, { status: 401 })
  const body = await request.json().catch(() => null)
  if (!body?.releaseCandidateId || !body?.buildId || !body?.organizationId || !body?.environment) return NextResponse.json({ error: 'releaseCandidateId, buildId, organizationId and environment are required' }, { status: 400 })
  const pkg = await getOwnedReleasePackage(user.id, String(body.releaseCandidateId), String(body.buildId))
  if (!pkg) return NextResponse.json({ error: 'release_package_not_found' }, { status: 404 })
  const approval = createReleaseApproval({
    releaseCandidateId: pkg.candidate.releaseCandidateId, buildId: pkg.build.buildId, executionId: pkg.build.executionId,
    organizationId: String(body.organizationId), ownerId: user.id, environment: String(body.environment),
    packageFingerprint: pkg.build.packageFingerprint, approvedBy: String(body.approvedBy || 'trusted-control-plane'), status: 'approved',
  })
  await persistReleaseApproval(approval)
  return NextResponse.json({ approval }, { status: 201 })
}
