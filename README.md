# AK VISIO Software Factory V2

Standalone software factory control plane for REQUEST → PLANNER → GENERATOR → TEST → SELF-HEALING → RE-TEST → VALIDATOR → GO-LIVE.

## Product
Operational workspace for requests, runs, generated projects, repairs, validation and audit history.

## Isolation
V2 uses its own GitHub repository and dedicated Supabase project. It is intentionally isolated from ADTRAN Realindo.

## Security
- Supabase Row Level Security is enabled and forced on `factory_projects` and `factory_requests`.
- Ownership policies enforce `auth.uid() = owner_id`.
- Request inserts additionally require the referenced project to belong to the authenticated owner.
- Login verifies that a persisted Supabase session exists before entering the request workspace.

## Local engine
The hardened local factory engine lives under `E:\AK-VISIO-SOFTWARE-FACTORY-V2` and has passed the V2 E2E and hardening gates.

## Production runtime
The intended production runtime is the Cloudflare Worker:
`https://ak-visio-software-factory-v2.dwahyudi8377.workers.dev`

The repository CI verifies the Next.js build, Docker definition, and production health endpoint. A live browser/authenticated end-to-end check must still be performed against the deployed Worker after the latest commit is deployed; GitHub/Supabase access alone cannot prove that external deployment has picked up the latest source.
