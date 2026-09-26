import type { ApprovalRecord, SafetyLevel } from "../runtime/core-types.js";

export function createApprovalRequest(
  input: Omit<ApprovalRecord, "status" | "created_at">
): ApprovalRecord {
  return {
    ...input,
    status: "PENDING",
    created_at: new Date().toISOString()
  };
}

export function validateApprovalTransition(
  current: ApprovalRecord["status"],
  next: ApprovalRecord["status"]
): boolean {
  const allowed: Record<ApprovalRecord["status"], ApprovalRecord["status"][]> = {
    PENDING: ["APPROVED", "REJECTED", "CANCELLED", "EXPIRED"],
    APPROVED: ["CANCELLED"],
    REJECTED: [],
    EXPIRED: [],
    CANCELLED: []
  };
  return allowed[current].includes(next);
}

export function approvalRequired(level: SafetyLevel): boolean {
  return level >= 3;
}
