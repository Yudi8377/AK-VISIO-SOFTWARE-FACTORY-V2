import type { GeneratedArtifact } from './execution.ts'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function persistFactoryExecution(
  ownerId: string,
  organizationId: string,
  executionId: string,
  requestPrompt: string,
  artifacts: GeneratedArtifact[],
) {
  const supabase = await createServerSupabaseClient()

  const { error: runError } = await supabase.from('factory_execution_runs').upsert({
    execution_id: executionId,
    owner_id: ownerId,
    organization_id: organizationId,
    prompt: requestPrompt,
    status: 'completed',
    artifact_count: artifacts.length,
    completed_at: new Date().toISOString(),
  }, { onConflict: 'execution_id' })

  if (runError) throw runError

  if (artifacts.length === 0) return

  const rows = artifacts.map(artifact => ({
    artifact_id: artifact.artifactId,
    owner_id: ownerId,
    execution_id: executionId,
    type: artifact.type,
    business_dna_version: artifact.businessDnaVersion,
    status: artifact.status,
    risk: artifact.risk,
    source_refs: artifact.sourceRefs,
    approval_refs: artifact.approvalRefs,
    license_refs: artifact.licenseRefs,
    content_hash: artifact.contentHash,
    content: artifact.content,
    execution_version: artifact.executionVersion,
  }))

  const { error: artifactError } = await supabase
    .from('factory_artifacts')
    .upsert(rows, { onConflict: 'owner_id,artifact_id' })

  if (artifactError) throw artifactError
}

export async function listOwnedArtifacts(ownerId: string) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('factory_artifacts')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) throw error
  return data ?? []
}
