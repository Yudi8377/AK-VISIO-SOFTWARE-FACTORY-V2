import type { BusinessDNA, FactoryArtifact, RiskLevel } from './contracts.ts'
import { evaluatePolicy } from './policy.ts'

export type FactoryIntent = {
  prompt: string
  organizationId: string
  requestedTargets?: string[]
  risk?: RiskLevel
}

export type GenerationPlan = {
  intent: FactoryIntent
  businessDna: BusinessDNA
  stages: string[]
  policy: ReturnType<typeof evaluatePolicy>
}

export function createBusinessDNA(input: FactoryIntent): BusinessDNA {
  return {
    id: `dna-${input.organizationId}`,
    version: '1.0.0',
    organization: { id: input.organizationId, name: input.organizationId === 'akvisio' ? 'AKVISIO' : input.organizationId },
    industry: 'unspecified',
    jurisdictions: ['ID'],
    productsServices: [],
    channels: ['web'],
    entities: [],
    processes: [],
    workflows: [],
    roles: [],
    capabilities: [],
    documents: [],
    taxProfile: {},
    regulatoryProfile: {},
    brandDesign: {},
    deploymentTargets: input.requestedTargets ?? ['web'],
  }
}

export function planGeneration(input: FactoryIntent): GenerationPlan {
  const dna = createBusinessDNA(input)
  const risk = input.risk ?? 'medium'
  return {
    intent: input,
    businessDna: dna,
    stages: ['discovery','business-dna','architecture','design','data-api','application','admin','documents','qa-security','build-release'],
    policy: evaluatePolicy('generate_application', risk),
  }
}

export function createArtifact(
  type: string,
  businessDnaVersion: string,
  risk: RiskLevel = 'medium',
): FactoryArtifact {
  return {
    artifactId: `artifact-${crypto.randomUUID()}`,
    type,
    businessDnaVersion,
    status: 'draft',
    risk,
    sourceRefs: [],
    approvalRefs: [],
    licenseRefs: [],
  }
}
