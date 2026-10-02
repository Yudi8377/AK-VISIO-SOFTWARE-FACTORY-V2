import { NextResponse } from 'next/server'
import { executeBuild } from '@/lib/enterprise/build'
import { getOwnedArtifactHashes, getOwnedQualityEvidenceHash, getOwnedReleaseCandidate, persistBuildEvidence } from '@/lib/enterprise/build-repository'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'authentication_required' }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (!body?.releaseCandidateId || !body?.organizationId) {
    return NextResponse.json({ error: 'releaseCandidateId and organizationId are required' }, { status: 400 })
  }

  const candidate = await getOwnedReleaseCandidate(user.id, String(body.releaseCandidateId))
  if (!candidate) return NextResponse.json({ error: 'release_candidate_not_found' }, { status: 404 })

  const evidence = await getOwnedQualityEvidenceHash(user.id, candidate.qualityEvidenceId)
  if (!evidence || evidence.status !== 'passed' || !evidence.release_candidate_eligible) {
    return NextResponse.json({ error: 'quality_gate_failed' }, { status: 422 })
  }

  const artifactHashes = await getOwnedArtifactHashes(user.id, candidate.artifactIds)
  const sourceRevision = String(process.env.VERCEL_GIT_COMMIT_SHA || process.env.GIT_COMMIT_SHA || 'runtime-unpinned')

  try {
    const build = executeBuild({
      candidate,
      artifactHashes: artifactHashes.map(row => ({ artifactId: String(row.artifact_id), contentHash: String(row.content_hash) })),
      qualityEvidenceHash: String(evidence.evidence_hash),
      sourceRevision,
    })
    await persistBuildEvidence(user.id, String(body.organizationId), build)
    return NextResponse.json({ build, releaseEligible: true }, { status: 200 })
  } catch (err) {
    const code = err instanceof Error ? err.message : 'build_failed'
    return NextResponse.json({ error: code }, { status: 422 })
  }
}
