import { createHash } from 'node:crypto'

export type DeploymentLifecycleState =
  | 'requested'
  | 'provider_accepted'
  | 'verified'
  | 'promoted'
  | 'rolled_back'
  | 'failed'

export type DeploymentLifecycleAction =
  | 'request'
  | 'provider_accept'
  | 'verify'
  | 'promote'
  | 'rollback'
  | 'fail'

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

const transitions: Record<DeploymentLifecycleState, Partial<Record<DeploymentLifecycleAction, DeploymentLifecycleState>>> = {
  requested: { provider_accept: 'provider_accepted', fail: 'failed' },
  provider_accepted: { verify: 'verified', fail: 'failed' },
  verified: { promote: 'promoted', rollback: 'rolled_back', fail: 'failed' },
  promoted: { rollback: 'rolled_back' },
  rolled_back: {},
  failed: {},
}

export function assertDeploymentTransition(
  from: DeploymentLifecycleState,
  action: DeploymentLifecycleAction,
): DeploymentLifecycleState {
  const next = transitions[from]?.[action]
  if (!next) throw new Error(`invalid_deployment_transition:${from}:${action}`)
  return next
}

export function computeDeploymentStateHash(input: {
  deploymentId: string
  state: DeploymentLifecycleState
  action: DeploymentLifecycleAction
  evidenceHash: string
  changedAt: string
}): string {
  return createHash('sha256').update(JSON.stringify(input)).digest('hex')
}

export function assertVerifiedDeployment(input: {
  state: DeploymentLifecycleState
  verificationStatus: 'pending' | 'passed' | 'failed'
  providerReference: string
}): void {
  if ((input.state !== 'verified' && input.state !== 'promoted') || input.verificationStatus !== 'passed') {
    throw new Error('deployment_verification_required')
  }
  if (!input.providerReference || input.providerReference === 'unavailable') {
    throw new Error('deployment_provider_reference_missing')
  }
}
