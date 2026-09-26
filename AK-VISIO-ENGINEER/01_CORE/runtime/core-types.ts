export type SafetyLevel = 0 | 1 | 2 | 3 | 4 | 5;
export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED" | "CANCELLED";
export type DiagnosisStatus = "CONFIRMED" | "PROBABLE" | "POSSIBLE" | "UNKNOWN" | "INSUFFICIENT_EVIDENCE";

export interface ModuleManifest {
  module_id: string;
  module_name: string;
  version: string;
  platform: string[];
  capabilities: string[];
  offline_capabilities: string[];
  online_capabilities?: string[];
  safety_profile: string;
  security_profile: string;
  dependencies?: string[];
}

export interface EvidenceRecord {
  evidence_id: string;
  case_id: string;
  type: string;
  captured_at: string;
  source: string;
  operator_id?: string | null;
  sha256?: string | null;
  provenance?: Record<string, unknown>;
}

export interface ApprovalRecord {
  approval_id: string;
  action_id: string;
  risk_level: SafetyLevel;
  status: ApprovalStatus;
  requested_by: string;
  approved_by?: string | null;
  reason: string;
  created_at: string;
}
