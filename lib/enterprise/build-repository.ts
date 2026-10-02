import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { ReleaseCandidate } from './release.ts'
import type { BuildEvidence } from './build.ts'

function toCandidate(row: Record<string, unknown>): ReleaseCandidate {
  return {
    releaseCandidateId: String(row.release_candidate_id),
    executionId: String(row.execution_id),
    artifactIds: Array.isArray(row.artifact_ids) ? row.artifact_ids.map(String) : [],
    qualityEvidenceId: String(row.quality_evidence_id),
    qualityEvidenceHash: String(row.quality_evidence_hash),
    status: row.status as ReleaseCandidate['status'],
    buildStatus: row.build_status as ReleaseCandidate['buildStatus'],
    releaseEngineVersion: String(row.release_engine_version),
    candidateHash: String(row.candidate_hash),
    createdAt: String(row.created_at),
  }
}

export async function getOwnedReleaseCandidate(ownerId: string, releaseCandidateId: string) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.from('factory_release_candidates').select('*')
    .eq('owner_id', ownerId).eq('release_candidate_id', releaseCandidateId).maybeSingle()
  if (error) throw error
  return data ? toCandidate(data) : null
}

export async function getOwnedQualityEvidenceHash(ownerId: string, evidenceId: string) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.from('factory_quality_evidence')
    .select('evidence_id,evidence_hash,status,release_candidate_eligible')
    .eq('owner_id', ownerId).eq('evidence_id', evidenceId).maybeSingle()
  if (error) throw error
  return data ?? null
}

export async function getOwnedArtifactHashes(ownerId: string, artifactIds: string[]) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.from('factory_artifacts').select('artifact_id,content_hash')
    .eq('owner_id', ownerId).in('artifact_id', artifactIds)
  if (error) throw error
  return data ?? []
}

export async function persistBuildEvidence(ownerId: string, organizationId: string, evidence: BuildEvidence) {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.from('factory_build_evidence').upsert({
    build_id: evidence.buildId,
    release_candidate_id: evidence.releaseCandidateId,
    execution_id: evidence.executionId,
    owner_id: ownerId,
    organization_id: organizationId,
    status: evidence.status,
    build_engine_version: evidence.buildEngineVersion,
    candidate_hash: evidence.candidateHash,
    quality_evidence_hash: evidence.qualityEvidenceHash,
    artifact_ids: evidence.artifactIds,
    artifact_hashes: evidence.artifactHashes,
    source_revision: evidence.sourceRevision,
    package_fingerprint: evidence.packageFingerprint,
    built_at: evidence.builtAt,
  }, { onConflict: 'owner_id,build_id' })
  if (error) throw error

  const { error: candidateError } = await supabase.from('factory_release_candidates')
    .update({ build_status: evidence.status === 'passed' ? 'passed' : 'failed' })
    .eq('owner_id', ownerId).eq('release_candidate_id', evidence.releaseCandidateId)
  if (candidateError) throw candidateError
}

export async function listOwnedBuildEvidence(ownerId: string) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.from('factory_build_evidence').select('*')
    .eq('owner_id', ownerId).order('built_at', { ascending: false }).limit(200)
  if (error) throw error
  return data ?? []
}
