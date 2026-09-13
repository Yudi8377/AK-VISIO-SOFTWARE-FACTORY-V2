# AK VISIO Software Factory V2 — Go-Live Runbook

## Scope
This product is standalone and must remain isolated from ADTRAN Realindo and all V1 runtime dependencies.

## Required configuration
Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in the hosting provider environment. Never commit secrets.

## Validation gates
1. GitHub Actions CI must be green.
2. Supabase RLS must remain enabled on factory tables.
3. Authenticated ownership policies must remain enforced.
4. Local engine E2E must report seven PASS stages.
5. Deployment must be verified by loading the deployed application and checking runtime errors.

## Production deployment
The repository is deployment-ready. Production deployment requires an authenticated hosting account/team. The current connected Vercel account exposes no teams, so no production deployment is claimed until hosting access is available.

## Rollback
Use the previous known-good deployment or commit. Do not bypass CI. Database changes must be applied through versioned migrations.
