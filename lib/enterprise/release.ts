import { createHash } from 'node:crypto'
import type { GeneratedArtifact } from './execution.ts'
import type { QualityEvidence } from './qa.ts'

export const RELEASE_ENGINE_VERSION = '1.0.0'
export type ReleaseCandidateStatus = 'eligible' | 'blocked'
export type BuildStatus = 'not-started' | 'passed' | 'failed'

export type ReleaseCandidate = {
  releaseCandidateId: string
  executionId: string
  artifactIds: string[]
  qualityEvidenceId: string
  qualityEvidenceHash: string
  status: ReleaseCandidateStatus
  buildStatus: BuildStatus
  releaseEngineVersion: string
  candidateHash: string
  createdAt: string
}

function stable(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value)) return '[' + value.map(stable).join(',') + ']'
  const r = value as Record<string, unknown>
  return '{' + Object.keys(r).sort().map(k => JSON.stringify(k) + ':' + stable(r[k])).join(',') + '}'
}

function hash(value: unknown) {
  return createHash('sha256').update(stable(value)).digest('hex')
}

export function createReleaseCandidate(
  executionId: string,
  artifacts: GeneratedArtifact[],
  evidence: QualityEvidence,
): ReleaseCandidate {
  const blocking = evidence.status !== 'passed' || !evidence.releaseCandidateEligible || artifacts.length === 0
  const status: ReleaseCandidateStatus = blocking ? 'blocked' : 'eligible'
  const artifactIds = artifacts.map(a => a.artifactId).sort()
  const candidateBody = {
    executionId,
    artifactIds,
    qualityEvidenceId: evidence.evidenceId,
    qualityEvidenceHash: evidence.evidenceHash,
    releaseEngineVersion: RELEASE_ENGINE_VERSION,
    status,
  }
  const candidateHash = hash(candidateBody)

  return {
    releaseCandidateId: 'rc-' + candidateHash.slice(0, 24),
    executionId,
    artifactIds,
    qualityEvidenceId: evidence.evidenceId,
    qualityEvidenceHash: evidence.evidenceHash,
    status,
    buildStatus: 'not-started',
    releaseEngineVersion: RELEASE_ENGINE_VERSION,
    candidateHash,
    createdAt: new Date().toISOString(),
  }
}

export function assertBuildEligible(candidate: ReleaseCandidate): void {
  if (candidate.status !== 'eligible') throw new Error('release_candidate_blocked')
}

export function markBuildResult(candidate: ReleaseCandidate, passed: boolean): ReleaseCandidate {
  assertBuildEligible(candidate)
  return { ...candidate, buildStatus: passed ? 'passed' : 'failed' }
}

export function assertReleaseEligible(candidate: ReleaseCandidate): void {
  if (candidate.status !== 'eligible' || candidate.buildStatus !== 'passed') {
    throw new Error('release_gate_failed')
  }
}
