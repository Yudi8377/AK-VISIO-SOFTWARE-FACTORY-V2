# Factory Execution Engine v1.0

## Purpose

The runtime is no longer limited to producing a generation plan. It now executes the plan into deterministic, versioned artifacts and persists those artifacts in an owner-scoped registry.

## Execution contract

REQUEST → BUSINESS DNA → GENERATION PLAN → EXECUTION → ARTIFACT REGISTRY.

One execution produces eight contract artifacts:

1. application manifest
2. module generation
3. data model
4. API contract
5. UI contract
6. admin contract
7. document contract
8. test contract

The generator is provider-independent. It does not require an LLM to establish the factory's control contract.

## Integrity

Each generated artifact receives a SHA-256 content hash. Artifact IDs are deterministic for identical content, so retries are idempotent at the registry boundary.

## Governance

High-risk and critical generation requests remain blocked unless explicit approval is supplied. Artifact lifecycle is monotonic:

draft → generated → review → approved → released

Superseding an artifact is terminal. Invalid transitions fail closed.

## Persistence

`factory_execution_runs` records execution ownership and outcome. `factory_artifacts` is the durable registry. Both tables are protected by Supabase RLS using `auth.uid()`.

## API

- `POST /api/factory/execute` — authenticated execution endpoint.
- `GET /api/factory/artifacts` — authenticated owner-scoped artifact registry.

## Release rule

Artifact persistence is not equivalent to release readiness. QA/security, validator evidence, approval and production-health gates remain separate stages.

## Checkpoint

Implementation branch checkpoint: Factory Execution + Artifact Registry contract slice.
