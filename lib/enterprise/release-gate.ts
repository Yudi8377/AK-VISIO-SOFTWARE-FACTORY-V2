import type { DeploymentLifecycleState } from './deployment-state.ts'

export type ReleaseGateDecision = 'eligible' | 'blocked'

export function assertAutonomousReleaseGate(input: {
  state: DeploymentLifecycleState
  environment: string
  providerReference: string
  verificationStatus: 'pending' | 'passed' | 'failed'
  packageFingerprint: string
  approvalPackageFingerprint: string
  approvalEnvironment: string
  approvalStatus: 'approved' | 'rejected'
}): void {
  if (input.state !== 'verified') throw new Error('release_gate_requires_verified_deployment')
  if (input.verificationStatus !== 'passed') throw new Error('release_gate_verification_required')
  if (!input.providerReference || input.providerReference === 'unavailable') throw new Error('release_gate_provider_reference_missing')
  if (input.approvalStatus !== 'approved') throw new Error('release_gate_approval_required')
  if (input.packageFingerprint !== input.approvalPackageFingerprint) throw new Error('release_gate_package_mismatch')
  if (input.environment !== input.approvalEnvironment) throw new Error('release_gate_environment_mismatch')
}

export function createReleaseGateDecision(input: Parameters<typeof assertAutonomousReleaseGate>[0]) {
  try {
    assertAutonomousReleaseGate(input)
    return { decision: 'eligible' as const, reason: 'all_release_gates_passed' }
  } catch (error) {
    return { decision: 'blocked' as const, reason: error instanceof Error ? error.message : 'release_gate_failed' }
  }
}
