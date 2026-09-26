export interface AuditEvent {
  id: string;
  actor_id?: string | null;
  action: string;
  target_type?: string;
  target_id?: string;
  details?: Record<string, unknown>;
  created_at: string;
}

export function createAuditEvent(input: Omit<AuditEvent, "created_at">): AuditEvent {
  return { ...input, created_at: new Date().toISOString() };
}
