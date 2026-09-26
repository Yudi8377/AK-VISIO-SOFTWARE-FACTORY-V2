import type { SafetyLevel } from "../runtime/core-types.js";

export function requiresHumanApproval(level: SafetyLevel): boolean {
  return level >= 3;
}

export function mayExecuteAutonomously(level: SafetyLevel): boolean {
  return level <= 2;
}

export function safetyLabel(level: SafetyLevel): string {
  return [
    "INFORMATION",
    "OBSERVATION",
    "NON_INVASIVE_DIAGNOSTICS",
    "CONTROLLED_INTERVENTION",
    "PHYSICAL_INTERVENTION",
    "HIGH_RISK_OPERATION"
  ][level];
}
