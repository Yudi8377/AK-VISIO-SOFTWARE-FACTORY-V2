import { createHash } from 'node:crypto'
import type { ReleaseCandidate } from './release.ts'

export const BUILD_ENGINE_VERSION = '1.0.0'
export type BuildEvidenceStatus = 'passed' | 'failed'

export type BuildInput = {
  candidate: ReleaseCandidate
  artifactHashes: Array<{ artifactId: string; contentHash: string }>
  qualityEvidenceHash: string
  sourceRevision: string
}

export type BuildEvidence = {
  buildId: string
  releaseCandidateId: string
  executionId: string
  status: BuildEvidenceStatus
  buildEngineVersion: string
  candidateHash: string
  qualityEvidenceHash: string
  artifactIds: string[]
  artifactHashes: Array<{ artifactId: string; contentHash: string }>
  sourceRevision: string
  packageFingerprint: string
  builtAt: string
}

function stable(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value)) return '[' + value.map(stable).join(',') + ']'
  const record = value as Record<string, unknown>
  return '{' + Object.keys(record).sort().map(key => JSON.stringify(key) + ':' + stable(record[key])).join(',') + '}'
}

function hash(value: unknown): string {
  return createHash('sha256').update(stable(value)).digest('hex')
}

function validSha(value: string): boolean {
  return /^[a-f0-9]{64}$/.test(value)
}

export function executeBuild(input: BuildInput): BuildEvidence {
  const { candidate } = input
  if (candidate.status !== 'eligible') throw new Error('build_candidate_blocked')
  if (candidate.buildStatus === 'passed') throw new Error('build_already_completed')
  if (candidate.qualityEvidenceHash !== input.qualityEvidenceHash) throw new Error('build_quality_evidence_mismatch')
  if (candidate.artifactIds.length === 0) throw new Error('build_artifacts_missing')

  const expectedIds = [...candidate.artifactIds].sort()
  const supplied = [...input.artifactHashes].sort((a, b) => a.artifactId.localeCompare(b.artifactId))
  if (supplied.length !== expectedIds.length || supplied.some((item, index) => item.artifactId !== expectedIds[index] || !validSha(item.contentHash))) {
    throw new Error('build_artifact_integrity_failed')
  }

  const packageFingerprint = hash({
    buildEngineVersion: BUILD_ENGINE_VERSION,
    candidateHash: candidate.candidateHash,
    qualityEvidenceHash: input.qualityEvidenceHash,
    artifacts: supplied,
    sourceRevision: input.sourceRevision,
  })

  return {
    buildId: 'build-' + packageFingerprint.slice(0, 24),
    releaseCandidateId: candidate.releaseCandidateId,
    executionId: candidate.executionId,
    status: 'passed',
    buildEngineVersion: BUILD_ENGINE_VERSION,
    candidateHash: candidate.candidateHash,
    qualityEvidenceHash: input.qualityEvidenceHash,
    artifactIds: expectedIds,
    artifactHashes: supplied,
    sourceRevision: input.sourceRevision,
    packageFingerprint,
    builtAt: new Date().toISOString(),
  }
}

export function assertBuildPassed(evidence: BuildEvidence): void {
  if (evidence.status !== 'passed') throw new Error('build_gate_failed')
}
