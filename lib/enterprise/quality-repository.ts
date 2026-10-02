import type { QualityEvidence } from './qa.ts'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function persistQualityEvidence(ownerId: string, organizationId: string, evidence: QualityEvidence) {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.from('factory_quality_evidence').upsert({
    evidence_id: evidence.evidenceId,
    execution_id: evidence.executionId,
    owner_id: ownerId,
    organization_id: organizationId,
    validator_version: evidence.validatorVersion,
    status: evidence.status,
    release_candidate_eligible: evidence.releaseCandidateEligible,
    artifact_ids: evidence.artifactIds,
    findings: evidence.findings,
    evidence_hash: evidence.evidenceHash,
    checked_at: evidence.checkedAt,
  }, { onConflict: 'owner_id,evidence_id' })

  if (error) throw error
}

export async function listOwnedQualityEvidence(ownerId: string) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('factory_quality_evidence')
    .select('*')
    .eq('owner_id', ownerId)
    .order('checked_at', { ascending: false })
    .limit(200)

  if (error) throw error
  return data ?? []
}
