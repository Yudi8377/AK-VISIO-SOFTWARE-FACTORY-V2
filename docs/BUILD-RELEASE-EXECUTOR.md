# Build / Release Executor

The build plane converts an eligible release candidate into independently verifiable build evidence.

Pipeline:

CONTROL PLANE → BUSINESS DNA → GENERATION PLAN → FACTORY EXECUTION → ARTIFACT REGISTRY → QA/SECURITY → QUALITY EVIDENCE → RELEASE CANDIDATE → BUILD EVIDENCE → RELEASE

## Guarantees

- only authenticated owners can invoke the build API;
- the API accepts only a release-candidate identifier, never caller-supplied approval or build status;
- the candidate and QA evidence are loaded from owner-scoped persistence;
- every candidate artifact must exist and carry a valid SHA-256 content hash;
- the quality evidence hash must match the candidate;
- the build produces a deterministic package fingerprint from the governed candidate, evidence, artifact hashes, engine version, and source revision;
- build evidence is persisted with owner-scoped RLS;
- production authorization remains outside the build executor.

## API

POST /api/factory/build

Body: { releaseCandidateId: ..., organizationId: ... }

GET /api/factory/builds

The build endpoint does not expose a caller-controlled passed flag.

## Next boundary

A subsequent release/deployment plane must require an explicit trusted control-plane approval, verify the build fingerprint, and record promotion, deployment, and rollback evidence before production changes are allowed.
