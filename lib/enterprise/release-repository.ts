import type { ReleaseCandidate } from './release.ts'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function persistReleaseCandidate(ownerId: string, organizationId: string, candidate: ReleaseCandidate) {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.from('factory_release_candidates').upsert({
    release_candidate_id: candidate.releaseCandidateId,
    execution_id: candidate.executionId,
    owner_id: ownerId,
    organization_id: organizationId,
    artifact_ids: candidate.artifactIds,
    quality_evidence_id: candidate.qualityEvidenceId,
    quality_evidence_hash: candidate.qualityEvidenceHash,
    status: candidate.status,
    build_status: candidate.buildStatus,
    release_engine_version: candidate.releaseEngineVersion,
    candidate_hash: candidate.candidateHash,
    created_at: candidate.createdAt,
  }, { onConflict: 'owner_id,release_candidate_id' })
  if (error) throw error
}

export async function listOwnedReleaseCandidates(ownerId: string) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.from('factory_release_candidates')
    .select('*').eq('owner_id', ownerId).order('created_at', { ascending: false }).limit(200)
  if (error) throw error
  return data ?? []
}
