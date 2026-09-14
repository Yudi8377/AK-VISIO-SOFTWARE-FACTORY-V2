export type FactoryStage = 'REQUEST' | 'PLANNER' | 'GENERATOR' | 'TEST' | 'SELF_HEALING' | 'RE_TEST' | 'VALIDATOR' | 'GO_LIVE'
export type FactoryStatus = 'PENDING' | 'RUNNING' | 'PASSED' | 'FAILED' | 'BLOCKED' | 'CANCELLED'

export type FactoryEvidence = {
  stage: FactoryStage
  status: FactoryStatus
  confidence: number
  checks: string[]
  failures: string[]
}

export type AutonomyInput = {
  stage: FactoryStage
  evidence: FactoryEvidence[]
  repairAttempts: number
  maxRepairAttempts?: number
  approvalGranted: boolean
  productionHealthy: boolean
}

export type AutonomyDecision = {
  action: 'PLAN' | 'GENERATE' | 'TEST' | 'REPAIR' | 'RE_TEST' | 'VALIDATE' | 'GO_LIVE' | 'BLOCK'
  reason: string
  risk: 'LOW' | 'MEDIUM' | 'HIGH'
  nextStage?: FactoryStage
}

const ORDER: FactoryStage[] = ['REQUEST','PLANNER','GENERATOR','TEST','SELF_HEALING','RE_TEST','VALIDATOR','GO_LIVE']

function evidenceFor(evidence: FactoryEvidence[], stage: FactoryStage) {
  return evidence.find((item) => item.stage === stage)
}

function passed(evidence: FactoryEvidence[], stage: FactoryStage) {
  const item = evidenceFor(evidence, stage)
  return Boolean(item && item.status === 'PASSED' && item.confidence >= 0.9 && item.failures.length === 0)
}

export function decideNextAction(input: AutonomyInput): AutonomyDecision {
  const maxRepairs = Math.max(1, input.maxRepairAttempts ?? 3)
  if (!input.productionHealthy) return { action: 'BLOCK', reason: 'production_health_gate_failed', risk: 'HIGH' }

  switch (input.stage) {
    case 'REQUEST': return passed(input.evidence, 'REQUEST') ? { action: 'PLAN', reason: 'request_verified', risk: 'LOW', nextStage: 'PLANNER' } : { action: 'BLOCK', reason: 'request_evidence_missing', risk: 'MEDIUM' }
    case 'PLANNER': return passed(input.evidence, 'PLANNER') ? { action: 'GENERATE', reason: 'plan_verified', risk: 'LOW', nextStage: 'GENERATOR' } : { action: 'BLOCK', reason: 'plan_evidence_missing', risk: 'MEDIUM' }
    case 'GENERATOR': return passed(input.evidence, 'GENERATOR') ? { action: 'TEST', reason: 'generation_verified', risk: 'MEDIUM', nextStage: 'TEST' } : { action: 'BLOCK', reason: 'generation_evidence_missing', risk: 'HIGH' }
    case 'TEST':
      if (passed(input.evidence, 'TEST')) return { action: 'VALIDATE', reason: 'test_passed_no_repair_required', risk: 'LOW', nextStage: 'VALIDATOR' }
      if (input.repairAttempts >= maxRepairs) return { action: 'BLOCK', reason: 'repair_budget_exhausted', risk: 'HIGH' }
      return { action: 'REPAIR', reason: 'test_failed_within_repair_budget', risk: 'MEDIUM', nextStage: 'SELF_HEALING' }
    case 'SELF_HEALING': return input.repairAttempts < maxRepairs ? { action: 'RE_TEST', reason: 'bounded_repair_requires_retest', risk: 'MEDIUM', nextStage: 'RE_TEST' } : { action: 'BLOCK', reason: 'repair_budget_exhausted', risk: 'HIGH' }
    case 'RE_TEST':
      if (passed(input.evidence, 'RE_TEST')) return { action: 'VALIDATE', reason: 'repair_verified_by_retest', risk: 'LOW', nextStage: 'VALIDATOR' }
      if (input.repairAttempts >= maxRepairs) return { action: 'BLOCK', reason: 'retest_failed_and_repair_budget_exhausted', risk: 'HIGH' }
      return { action: 'REPAIR', reason: 'retest_failed_with_remaining_budget', risk: 'MEDIUM', nextStage: 'SELF_HEALING' }
    case 'VALIDATOR': return passed(input.evidence, 'VALIDATOR') ? (input.approvalGranted ? { action: 'GO_LIVE', reason: 'validation_and_approval_verified', risk: 'HIGH', nextStage: 'GO_LIVE' } : { action: 'BLOCK', reason: 'go_live_approval_required', risk: 'HIGH' }) : { action: 'BLOCK', reason: 'validation_evidence_missing', risk: 'HIGH' }
    case 'GO_LIVE': return passed(input.evidence, 'GO_LIVE') ? { action: 'BLOCK', reason: 'release_already_verified', risk: 'LOW' } : { action: 'BLOCK', reason: 'go_live_requires_external_verified_release', risk: 'HIGH' }
  }
}

export function isValidStageTransition(from: FactoryStage, to: FactoryStage): boolean {
  const index = ORDER.indexOf(from)
  return index >= 0 && ORDER[index + 1] === to
}

export function computeRepairBudget(attempt: number, max = 3): { allowed: boolean; remaining: number } {
  const normalized = Math.max(0, Math.floor(attempt))
  const limit = Math.max(1, Math.floor(max))
  return { allowed: normalized < limit, remaining: Math.max(0, limit - normalized) }
}

export function buildRunIdempotencyKey(ownerId: string, requestId: string, stage: FactoryStage): string {
  return `${ownerId.trim()}:${requestId.trim()}:${stage}`
}
