import type { ArtifactStatus, FactoryArtifact } from './contracts.ts'
import type { GeneratedArtifact } from './execution.ts'

const transitions: Record<ArtifactStatus, ArtifactStatus[]> = {
  draft: ['generated'],
  generated: ['review', 'superseded'],
  review: ['approved', 'superseded'],
  approved: ['released', 'superseded'],
  released: ['superseded'],
  superseded: [],
}

export type ArtifactTransition = {
  artifactId: string
  from: ArtifactStatus
  to: ArtifactStatus
  reason: string
  at: string
}

export class ArtifactRegistry {
  private readonly artifacts = new Map<string, GeneratedArtifact>()
  private readonly history: ArtifactTransition[] = []

  register(artifact: GeneratedArtifact): GeneratedArtifact {
    if (this.artifacts.has(artifact.artifactId)) {
      const existing = this.artifacts.get(artifact.artifactId)!
      if (existing.hash !== artifact.hash) throw new Error('artifact_id_collision')
      return structuredClone(existing)
    }
    this.artifacts.set(artifact.artifactId, structuredClone(artifact))
    return structuredClone(artifact)
  }

  get(artifactId: string): GeneratedArtifact | null {
    const artifact = this.artifacts.get(artifactId)
    return artifact ? structuredClone(artifact) : null
  }

  list(): GeneratedArtifact[] {
    return [...this.artifacts.values()].map(artifact => structuredClone(artifact))
  }

  transitions(): ArtifactTransition[] {
    return this.history.map(item => ({ ...item }))
  }

  transition(artifactId: string, to: ArtifactStatus, reason: string, approvalRef?: string): GeneratedArtifact {
    const artifact = this.artifacts.get(artifactId)
    if (!artifact) throw new Error('artifact_not_found')

    if (!transitions[artifact.status].includes(to)) {
      throw new Error('invalid_artifact_transition:' + artifact.status + '->' + to)
    }

    const highRisk = artifact.risk === 'high' || artifact.risk === 'critical'
    if ((to === 'approved' || to === 'released') && highRisk && !approvalRef) {
      throw new Error('human_approval_required_for_high_risk_artifact')
    }

    const from = artifact.status
    artifact.status = to
    if (approvalRef) artifact.approvalRefs = [...new Set([...artifact.approvalRefs, approvalRef])]

    this.history.push({
      artifactId,
      from,
      to,
      reason,
      at: new Date().toISOString(),
    })

    return structuredClone(artifact)
  }
}

export function assertArtifactIntegrity(artifact: FactoryArtifact & { content?: unknown; contentHash?: string }): boolean {
  return Boolean(artifact.artifactId && artifact.type && artifact.businessDnaVersion && artifact.hash)
}
