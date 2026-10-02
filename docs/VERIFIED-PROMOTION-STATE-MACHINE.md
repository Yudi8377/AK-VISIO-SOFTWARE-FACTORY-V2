# Verified Promotion & Deployment State Machine

The release plane now separates provider acceptance from verified runtime success.

Lifecycle:
`requested → provider_accepted → verified → promoted`
and:
`verified → rolled_back`
Any executable stage may fail into `failed`.

Rules:
- A provider HTTP 2xx only establishes `provider_accepted`.
- Promotion requires `verified` state and verification_status=`passed`.
- Production promotion requires an explicit release approval bound to the exact package fingerprint.
- Rollback requires an explicit target deployment belonging to the same owner, organization, environment and provider.
- The rollback target must be a prior deploy with succeeded provider status and passed verification.
- State transitions and promotion evidence are server-written through the service-role path and read through owner-scoped RLS.
- Missing `DEPLOYMENT_VERIFY_URL` is fail-closed for promotion; the system records verification as pending rather than treating provider acceptance as runtime success.

Required runtime configuration:
- `DEPLOYMENT_PROVIDER`
- `DEPLOYMENT_WEBHOOK_URL`
- `DEPLOYMENT_WEBHOOK_SECRET`
- `DEPLOYMENT_VERIFY_URL`

This is intentionally provider-neutral. A provider adapter may accept a deployment while the independent verification endpoint determines whether the deployment is actually serving the expected runtime.
