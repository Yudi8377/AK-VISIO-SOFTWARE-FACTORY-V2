import type { RiskLevel } from './contracts'

export type PolicyDecision = {
  allowed: boolean
  requiresHumanApproval: boolean
  reason: string
}

const approvalRequired = new Set([
  'payment_execution',
  'tax_submission',
  'legal_publication',
  'production_deploy',
  'destructive_database_change',
  'bulk_delete',
])

export function evaluatePolicy(action: string, risk: RiskLevel, approved = false): PolicyDecision {
  const highRisk = risk === 'high' || risk === 'critical'
  const configured = approvalRequired.has(action)
  if (highRisk || configured) {
    return {
      allowed: approved,
      requiresHumanApproval: !approved,
      reason: approved ? 'Approved by policy gate.' : 'Human approval is required.',
    }
  }
  return { allowed: true, requiresHumanApproval: false, reason: 'Allowed by default policy.' }
}
