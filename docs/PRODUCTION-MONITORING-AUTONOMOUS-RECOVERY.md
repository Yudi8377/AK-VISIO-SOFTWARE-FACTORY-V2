# Production Monitoring + Autonomous Recovery

This plane adds post-deployment health assessment and a fail-closed recovery gate.

Flow:
CONTROL PLANE -> RELEASE -> VERIFIED DEPLOYMENT -> MONITORING -> HEALTH DECISION -> RECOVERY GATE -> VERIFIED PRIOR DEPLOYMENT

Monitoring is healthy only when a deployment succeeded, lifecycle state is verified, verification passed, the provider returned a usable reference, and evidence is fresh within the configured maximum age.

Health states: healthy, degraded, unhealthy.

Recovery is eligible only for an unhealthy current deployment and a different prior deployment that succeeded as a deploy, is verified or promoted, has passed verification, has a usable provider reference, and belongs to the same owner, organization, environment, and provider.

No arbitrary rollback target is accepted. Provider execution remains a separate action and the gate does not bypass release/build/approval lineage.

The migration uses forced RLS. Monitoring/recovery writes are intended to use the existing server-side service-role repository pattern.

Automatic invocation still requires a trusted scheduler or provider callback. This release establishes the deterministic policy; it does not assume a scheduler exists merely because the API is deployed.
