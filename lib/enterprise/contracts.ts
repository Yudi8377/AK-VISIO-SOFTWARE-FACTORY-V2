export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type ArtifactStatus = 'draft' | 'generated' | 'review' | 'approved' | 'released' | 'superseded'

export type BusinessDNA = {
  id: string
  version: string
  organization: { id: string; name: string }
  industry: string
  jurisdictions: string[]
  productsServices: unknown[]
  channels: string[]
  entities: unknown[]
  processes: unknown[]
  workflows: unknown[]
  roles: unknown[]
  capabilities: string[]
  documents: unknown[]
  taxProfile?: Record<string, unknown>
  regulatoryProfile?: Record<string, unknown>
  brandDesign?: Record<string, unknown>
  deploymentTargets: string[]
}

export type FactoryArtifact = {
  artifactId: string
  type: string
  businessDnaVersion: string
  status: ArtifactStatus
  risk: RiskLevel
  sourceRefs: string[]
  approvalRefs: string[]
  licenseRefs: string[]
  hash?: string
}
