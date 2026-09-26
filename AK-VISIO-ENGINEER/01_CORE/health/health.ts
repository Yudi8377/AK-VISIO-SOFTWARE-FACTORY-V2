export interface HealthCheck {
  name: string;
  ok: boolean;
  details?: string;
}

export function summarizeHealth(checks: HealthCheck[]) {
  return {
    status: checks.every(c => c.ok) ? "HEALTHY" : "DEGRADED",
    checks,
    checked_at: new Date().toISOString()
  };
}
