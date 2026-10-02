# Trusted Scheduler + Autonomous Recovery

## Runtime contract

The recovery executor is exposed at POST /api/factory/recover and is intentionally not a public user endpoint.

Required header: x-autonomous-recovery-secret

Required request fields:
- ownerId
- currentDeploymentId
- targetDeploymentId
- organizationId
- environment

The executor uses the server-only Supabase service-role client because a scheduler has no interactive user session. The secret is the trusted invocation boundary; owner, organization, environment, deployment lineage, verification and provider gates remain fail-closed.

## Recovery flow

trusted scheduler → health assessment → autonomous recovery gate → target lineage integrity → rollback provider request → deployment evidence → provider_accepted → existing verification flow → rolled_back

A healthy or merely degraded deployment produces no recovery request.

Recovery is idempotent: the deterministic recovery execution ID is checked before a provider call, preventing the same current/target recovery decision from being executed repeatedly by overlapping scheduler runs.

## Scheduler

.github/workflows/autonomous-recovery.yml runs every 15 minutes and can also be dispatched manually.

Configure these GitHub Actions secrets before automatic recovery can execute:
- AUTONOMOUS_RECOVERY_URL
- AUTONOMOUS_RECOVERY_SECRET
- AUTONOMOUS_RECOVERY_OWNER_ID
- AUTONOMOUS_RECOVERY_CURRENT_DEPLOYMENT_ID
- AUTONOMOUS_RECOVERY_TARGET_DEPLOYMENT_ID
- AUTONOMOUS_RECOVERY_ORGANIZATION_ID
- AUTONOMOUS_RECOVERY_ENVIRONMENT

The workflow deliberately fails closed when any secret is absent.

## Provider and verification requirements

The executor still requires:
- DEPLOYMENT_WEBHOOK_URL
- DEPLOYMENT_WEBHOOK_SECRET
- configured deployment provider
- a verified, previously successful target deployment
- valid approval/build/release-candidate lineage
- matching owner, organization, environment and provider scope

Verification is not bypassed. A successful recovery provider response creates provider_accepted; the existing /api/factory/verify state transition remains responsible for verification and rollback completion.

## Security boundary

No public request body can authorize recovery. The scheduler secret is checked before any recovery work. Service-role database access is only used inside the trusted server executor and never exposed to the browser.

## Current operational limitation

The code and scheduler are deployable, but automatic execution remains intentionally disabled until the required GitHub Actions secrets and deployment-provider/verification environment variables exist. This is a configuration gate, not a code-path bypass.
