import { createHash } from 'node:crypto'
import type { BusinessDNA } from './contracts.ts'
import type { GeneratedArtifact } from './execution.ts'

export const QA_VALIDATOR_VERSION = '1.0.0'

export type QualityStatus = 'passed' | 'failed'
export type QualitySeverity = 'info' | 'warning' | 'error' | 'critical'

export type QualityFinding = {
  code: string
  severity: QualitySeverity
  message: string
  artifactId?: string
}

export type QualityEvidence = {
  evidenceId: string
  executionId: string
  validatorVersion: string
  status: QualityStatus
  releaseCandidateEligible: boolean
  findings: QualityFinding[]
  artifactIds: string[]
  evidenceHash: string
  checkedAt: string
}

export type QAInput = {
  executionId: string
  businessDna: BusinessDNA
  artifacts: GeneratedArtifact[]
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

function add(findings: QualityFinding[], code: string, severity: QualitySeverity, message: string, artifactId?: string) {
  findings.push({ code, severity, message, ...(artifactId ? { artifactId } : {}) })
}

function hasContentHash(artifact: GeneratedArtifact): boolean {
  return artifact.contentHash.length === 64 && /^[a-f0-9]{64}$/.test(artifact.contentHash)
}

function requiredTypes(): GeneratedArtifact['type'][] {
  return [
    'application-manifest',
    'module-generation',
    'data-model',
    'api-contract',
    'ui-contract',
    'admin-contract',
    'document-contract',
    'test-contract',
  ]
}

export function validateFactoryArtifacts(input: QAInput): QualityEvidence {
  const findings: QualityFinding[] = []
  const expected = new Set(requiredTypes())
  const seen = new Set<string>()

  if (!input.executionId) add(findings, 'EXECUTION_ID_MISSING', 'critical', 'Execution ID is required.')
  if (!input.businessDna?.version) add(findings, 'DNA_VERSION_MISSING', 'critical', 'Business DNA version is required.')
  if (input.artifacts.length !== expected.size) {
    add(findings, 'ARTIFACT_COUNT_MISMATCH', 'error', 'The factory must emit exactly the required contract artifact set.')
  }

  for (const artifact of input.artifacts) {
    seen.add(artifact.type)

    if (!expected.has(artifact.type)) add(findings, 'UNKNOWN_ARTIFACT_TYPE', 'error', 'Artifact type is outside the governed factory contract.', artifact.artifactId)
    if (artifact.businessDnaVersion !== input.businessDna.version) {
      add(findings, 'DNA_VERSION_MISMATCH', 'critical', 'Artifact Business DNA version differs from the execution Business DNA.', artifact.artifactId)
    }
    if (artifact.status !== 'generated') add(findings, 'INVALID_GENERATED_STATUS', 'error', 'Factory output must enter QA in generated state.', artifact.artifactId)
    if (!hasContentHash(artifact)) add(findings, 'INVALID_CONTENT_HASH', 'critical', 'Artifact content hash must be a 64-character SHA-256 digest.', artifact.artifactId)
    if (hasContentHash(artifact) && hash(artifact.content) !== artifact.contentHash) {
      add(findings, 'CONTENT_HASH_MISMATCH', 'critical', 'Artifact content does not match its declared SHA-256 hash.', artifact.artifactId)
    }
    if (!artifact.sourceRefs.some(ref => ref.startsWith('business-dna:' + input.businessDna.id + '@'))) {
      add(findings, 'SOURCE_DNA_REFERENCE_MISSING', 'error', 'Artifact must reference the exact Business DNA source.', artifact.artifactId)
    }
    if (artifact.risk === 'high' || artifact.risk === 'critical') {
      if (artifact.approvalRefs.length > 0) {
        add(findings, 'UNEXPECTED_APPROVAL_REFERENCE', 'warning', 'Generation QA does not treat approval references as proof of release authorization.', artifact.artifactId)
      }
    }
  }

  for (const type of expected) {
    if (!seen.has(type)) add(findings, 'REQUIRED_ARTIFACT_MISSING', 'critical', 'Required artifact type is missing: ' + type)
  }

  const api = input.artifacts.find(a => a.type === 'api-contract')
  if (api) {
    const endpoints = Array.isArray(api.content.endpoints) ? api.content.endpoints as Array<Record<string, unknown>> : []
    if (!endpoints.some(endpoint => endpoint.path === '/api/factory/execute' && endpoint.method === 'POST')) {
      add(findings, 'EXECUTION_API_CONTRACT_MISSING', 'error', 'Factory execution endpoint contract is missing.', api.artifactId)
    }
    if (api.content.ownership !== 'authenticated-owner') {
      add(findings, 'API_OWNERSHIP_CONTRACT_MISSING', 'critical', 'Factory API contract must require authenticated owner scope.', api.artifactId)
    }
  }

  const admin = input.artifacts.find(a => a.type === 'admin-contract')
  if (admin) {
    const controls = Array.isArray(admin.content.controls) ? admin.content.controls.map(String) : []
    for (const control of ['RBAC', 'capabilities', 'RLS', 'approval-gates']) {
      if (!controls.includes(control)) add(findings, 'ADMIN_SECURITY_CONTROL_MISSING', 'critical', 'Required admin security control missing: ' + control, admin.artifactId)
    }
  }

  const test = input.artifacts.find(a => a.type === 'test-contract')
  if (test) {
    const suites = Array.isArray(test.content.suites) ? test.content.suites.map(String) : []
    for (const suite of ['contract', 'unit', 'integration', 'security', 'authorization', 'artifact-integrity', 'build']) {
      if (!suites.includes(suite)) add(findings, 'TEST_SUITE_MISSING', 'error', 'Required QA suite missing: ' + suite, test.artifactId)
    }
    if (test.content.releaseGate !== 'all-required-evidence-passed') {
      add(findings, 'RELEASE_GATE_CONTRACT_MISSING', 'critical', 'Test contract must require all required evidence to pass.', test.artifactId)
    }
  }

  const blocking = findings.some(f => f.severity === 'error' || f.severity === 'critical')
  const status: QualityStatus = blocking ? 'failed' : 'passed'
  const evidenceBody = {
    executionId: input.executionId,
    validatorVersion: QA_VALIDATOR_VERSION,
    status,
    findings,
    artifactIds: input.artifacts.map(a => a.artifactId).sort(),
  }
  const evidenceHash = hash(evidenceBody)

  return {
    evidenceId: 'evidence-' + evidenceHash.slice(0, 24),
    executionId: input.executionId,
    validatorVersion: QA_VALIDATOR_VERSION,
    status,
    releaseCandidateEligible: status === 'passed',
    findings,
    artifactIds: input.artifacts.map(a => a.artifactId),
    evidenceHash,
    checkedAt: new Date().toISOString(),
  }
}

export function assertReleaseCandidateEligible(evidence: QualityEvidence): void {
  if (evidence.status !== 'passed' || !evidence.releaseCandidateEligible) {
    throw new Error('quality_gate_failed')
  }
}
