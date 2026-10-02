# QA / Security Execution Plane

The factory now validates generated artifacts before any release candidate can be considered eligible.

Pipeline:

CONTROL PLANE → BUSINESS DNA → GENERATION PLAN → FACTORY EXECUTION → ARTIFACT REGISTRY → QA/SECURITY → QUALITY EVIDENCE → RELEASE CANDIDATE → BUILD/RELEASE

## Runtime controls

The validator checks:

- exact governed artifact set
- Business DNA version consistency
- SHA-256 content integrity
- Business DNA source references
- authenticated-owner API contract
- RBAC, capabilities, RLS and approval-gate controls
- required contract/security/build test suites
- explicit all-evidence-passed release gate

Failures are fail-closed. A failed validation can never become a release candidate.

## Evidence boundary

Quality evidence records what was validated and when. It does not grant production authorization. Human approval and the later release gate remain separate control-plane decisions.

Evidence is persisted in `factory_quality_evidence` with owner-scoped RLS.

## API surfaces

- `POST /api/factory/validate` — execute the governed generation path, validate its artifacts, and persist quality evidence.
- `GET /api/factory/quality` — list quality evidence belonging to the authenticated owner.

## Security principle

The HTTP request cannot manufacture approval. QA verifies the generated result; authorization to release remains a separate trusted decision.
