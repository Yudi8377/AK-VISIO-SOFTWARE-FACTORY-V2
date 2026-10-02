# Enterprise Self-Healing Control Plane

The recovery layer now has a deterministic incident boundary around autonomous rollback.

## Safety controls
- One incident key is derived from owner, organization, environment, current deployment and rollback target.
- Recovery attempts are capped at 3 by default.
- A 30-minute cooldown suppresses repeated attempts after a failed attempt.
- A 5-minute lease prevents overlapping scheduler executions.
- Once the attempt limit is reached the incident is escalated and no further autonomous retries occur for that incident.
- A new current deployment creates a new incident key, so a later release is not trapped by an older incident.
- Recovery remains fail-closed: health, release lineage, provider configuration, scope and deployment-state gates still apply.
- Incident records are service-role managed and owner-readable through RLS.

## Operational lifecycle

detected -> recovering -> recovered

Failure paths:

recovering -> suppressed (cooldown)

recovering -> escalated (attempt limit)

A subsequent scheduler run may acquire an expired lease after cooldown. Successful verification closes the incident as recovered.

## Verification
The repository test suite includes deterministic policy tests for duplicate invocation protection, lease/cooldown decisions, attempt limits and incident identity.

The scheduler remains intentionally fail-closed when its trusted secrets are not configured.
