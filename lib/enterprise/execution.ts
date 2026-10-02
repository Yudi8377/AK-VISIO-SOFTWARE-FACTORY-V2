import { createHash } from 'node:crypto'
import type { BusinessDNA, FactoryArtifact, RiskLevel } from './contracts.ts'
import { evaluatePolicy } from './policy.ts'
import { planGeneration, type FactoryIntent, type GenerationPlan } from './runtime.ts'

export const FACTORY_EXECUTION_VERSION = '1.0.0'

export type ArtifactType =
  | 'application-manifest'
  | 'module-generation'
  | 'data-model'
  | 'api-contract'
  | 'ui-contract'
  | 'admin-contract'
  | 'document-contract'
  | 'test-contract'

export type GeneratedArtifact = FactoryArtifact & {
  type: ArtifactType
  content: Record<string, unknown>
  contentHash: string
  executionVersion: string
}

export type ExecutionResult = {
  executionId: string
  status: 'completed' | 'blocked'
  policy: ReturnType<typeof evaluatePolicy>
  plan: GenerationPlan
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

function artifact(
  type: ArtifactType,
  dna: BusinessDNA,
  planHash: string,
  risk: RiskLevel,
  content: Record<string, unknown>,
): GeneratedArtifact {
  const contentHash = hash(content)
  return {
    artifactId: 'artifact-' + contentHash.slice(0, 24),
    type,
    businessDnaVersion: dna.version,
    status: 'generated',
    risk,
    sourceRefs: ['business-dna:' + dna.id + '@' + dna.version, 'generation-plan:' + planHash],
    approvalRefs: [],
    licenseRefs: [],
    hash: contentHash,
    content,
    contentHash,
    executionVersion: FACTORY_EXECUTION_VERSION,
  }
}

export function executeGeneration(input: FactoryIntent & { approvalGranted?: boolean }): ExecutionResult {
  const plan = planGeneration(input)
  const risk = input.risk ?? 'medium'
  const policy = evaluatePolicy('generate_application', risk, input.approvalGranted ?? false)
  const executionId = 'execution-' + hash({ input, dna: plan.businessDna, version: FACTORY_EXECUTION_VERSION }).slice(0, 24)

  if (!policy.allowed) {
    return { executionId, status: 'blocked', policy, plan, artifacts: [] }
  }

  const dna = plan.businessDna
  const planHash = hash({ intent: plan.intent, businessDna: dna, stages: plan.stages })

  const artifacts: GeneratedArtifact[] = [
    artifact('application-manifest', dna, planHash, risk, {
      contractVersion: FACTORY_EXECUTION_VERSION,
      organization: dna.organization,
      industry: dna.industry,
      jurisdictions: dna.jurisdictions,
      deploymentTargets: dna.deploymentTargets,
      pipeline: plan.stages,
    }),
    artifact('module-generation', dna, planHash, risk, {
      modules: [
        'foundation',
        'authentication',
        'authorization',
        'audit',
        ...dna.capabilities.map(capability => 'capability:' + capability),
      ],
      sourceOfTruth: 'business-dna:' + dna.id + '@' + dna.version,
    }),
    artifact('data-model', dna, planHash, risk, {
      entities: [
        { name: 'organizations', source: 'foundation' },
        { name: 'users', source: 'authentication' },
        { name: 'roles', source: 'authorization' },
        { name: 'audit_events', source: 'audit' },
        ...dna.entities,
      ],
      rule: 'Business entities must be derived from versioned Business DNA.',
    }),
    artifact('api-contract', dna, planHash, risk, {
      version: 'v1',
      endpoints: [
        { method: 'GET', path: '/api/health' },
        { method: 'POST', path: '/api/factory/execute' },
        { method: 'GET', path: '/api/factory/artifacts' },
      ],
      ownership: 'authenticated-owner',
    }),
    artifact('ui-contract', dna, planHash, risk, {
      surfaces: ['public', 'authenticated', 'error', 'loading'],
      deploymentTargets: dna.deploymentTargets,
      accessibility: ['keyboard', 'semantic-structure', 'status-feedback'],
    }),
    artifact('admin-contract', dna, planHash, risk, {
      surfaces: ['requests', 'runs', 'artifacts', 'validation', 'audit'],
      controls: ['RBAC', 'capabilities', 'RLS', 'approval-gates'],
    }),
    artifact('document-contract', dna, planHash, risk, {
      documents: [
        { type: 'requirements', source: 'generation-plan' },
        { type: 'architecture', source: 'generation-plan' },
        { type: 'data-dictionary', source: 'data-model' },
        { type: 'api-reference', source: 'api-contract' },
        { type: 'release-record', source: 'qa-security' },
      ],
    }),
    artifact('test-contract', dna, planHash, risk, {
      suites: ['contract', 'unit', 'integration', 'security', 'authorization', 'artifact-integrity', 'build'],
      releaseGate: 'all-required-evidence-passed',
    }),
  ]

  return { executionId, status: 'completed', policy, plan, artifacts }
}
