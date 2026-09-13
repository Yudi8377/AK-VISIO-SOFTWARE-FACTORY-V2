# Release Checklist

## Repository and application
- [x] Dedicated Supabase project active
- [x] Security advisor clean
- [x] RLS ownership policies enabled and forced
- [x] Factory E2E local gate passed
- [x] Hardening gate passed
- [x] Next.js application scaffold committed
- [x] CI build workflow committed
- [x] Docker production definition committed
- [x] Obsolete GitHub Pages deployment workflow removed
- [x] ADTRAN Realindo remains isolated

## Authentication and data ownership
- [x] Login requires a successful password sign-in
- [x] Login verifies the persisted Supabase session before redirecting
- [x] Request workspace reads the authenticated session before database access
- [x] Project inserts use the authenticated user's ID as `owner_id`
- [x] Request inserts use the authenticated user's ID as `owner_id`
- [x] Request insert policy verifies the referenced project belongs to the same owner
- [x] Password recovery and update routes are present

## Production gate
- [x] CI includes production health smoke test
- [ ] Latest commit deployed to the Cloudflare Worker
- [ ] Live `/api/health` check passes on the latest deployment
- [ ] Live login → session persistence → request save → request reload E2E passes

The final three checks are intentionally runtime gates. They cannot be truthfully marked complete from repository/database access alone.
