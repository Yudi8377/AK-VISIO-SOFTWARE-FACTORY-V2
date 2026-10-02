# Release / Deployment Plane

Pipeline:

CONTROL PLANE → BUSINESS DNA → GENERATION → FACTORY EXECUTION → QA/SECURITY → QUALITY EVIDENCE → RELEASE CANDIDATE → BUILD EVIDENCE → TRUSTED RELEASE APPROVAL → DEPLOYMENT → PROMOTION/ROLLBACK → DEPLOYMENT EVIDENCE

## Security boundary

- release approval is not writable through the Supabase Data API;
- approval creation requires the server-only CONTROL_PLANE_APPROVAL_SECRET plus an authenticated owner;
- approval is bound to the exact release candidate, build, execution, environment, and package fingerprint;
- deployment revalidates candidate integrity, build status, approval integrity, lineage, environment, and package fingerprint;
- deployment and rollback use a configured server-side webhook with HMAC signing;
- deployment evidence is server-written and owner-scoped;
- clients cannot submit a passed flag, provider result, package fingerprint, or deployment success flag.

## Endpoints

- POST /api/factory/release-approval
- GET /api/factory/release-approvals
- POST /api/factory/deploy
- POST /api/factory/rollback
- GET /api/factory/deployments

## Required server configuration

- SUPABASE_SERVICE_ROLE_KEY (legacy) or the newer Supabase secret key when the server client is upgraded
- CONTROL_PLANE_APPROVAL_SECRET
- DEPLOYMENT_WEBHOOK_URL
- DEPLOYMENT_WEBHOOK_SECRET
- optional DEPLOYMENT_PROVIDER

No production deployment is claimed until a configured provider returns success and deployment evidence is persisted.
