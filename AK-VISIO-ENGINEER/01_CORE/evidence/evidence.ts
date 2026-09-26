import { createHash } from "node:crypto";
import type { EvidenceRecord } from "../runtime/core-types.js";

export function hashEvidence(content: string): string {
  return createHash("sha256").update(content, "utf8").digest("hex");
}

export function createEvidence(input: Omit<EvidenceRecord, "captured_at">): EvidenceRecord {
  return { ...input, captured_at: new Date().toISOString() };
}
