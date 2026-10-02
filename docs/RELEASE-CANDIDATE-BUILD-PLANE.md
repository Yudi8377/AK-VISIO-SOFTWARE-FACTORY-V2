# Release Candidate / Build Execution Plane

The factory now has a governed transition from validated artifacts to a release candidate.

Pipeline:

CONTROL PLANE → BUSINESS DNA → GENERATION PLAN → FACTORY EXECUTION → ARTIFACT REGISTRY → QA/SECURITY → QUALITY EVIDENCE → RELEASE CANDIDATE → BUILD → RELEASE

## Release candidate gate

A release candidate is eligible only when:

1. factory execution completed;
2. all governed artifacts exist;
3. QA evidence is passed;
4. quality evidence explicitly marks release-candidate eligibility.

The candidate carries the artifact IDs, quality evidence ID/hash, engine version and a deterministic candidate hash.

## Build gate

A candidate starts with `not-started`. It can transition to `passed` only through the build execution path. Production release requires both candidate eligibility and a passed build.

## Authorization boundary

A release candidate is **not** a production authorization. Human/control-plane approval remains separate. The factory cannot manufacture approval through an HTTP request.

## Persistence

Candidates are stored in `factory_release_candidates` with forced owner-scoped RLS.

## API

- `POST /api/factory/release-candidate` — generate, validate and create a governed candidate.
- `GET /api/factory/release-candidates` — list candidates owned by the authenticated user.
