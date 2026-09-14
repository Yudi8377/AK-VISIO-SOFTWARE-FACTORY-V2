# Autonomous Factory Kernel

AK VISIO is intended to behave as an execution control system, not merely a request dashboard.

## Core powers

1. **Deterministic next-action selection** — every stage produces one explicit next action or a BLOCK decision.
2. **Evidence-gated progression** — a stage is considered passed only with successful evidence, zero failures, and confidence >= 0.90.
3. **Bounded self-healing** — repair attempts have a hard budget; exhaustion blocks the run instead of looping forever.
4. **Fail-closed production gate** — unhealthy production blocks autonomous progression.
5. **Approval gate** — validation alone cannot authorize go-live without explicit approval.
6. **Idempotency** — run actions can be keyed by owner + request + stage to prevent accidental duplicate execution.
7. **Explicit state machine** — stage transitions are constrained to the factory's canonical order.

## Design rule

The factory may become highly autonomous internally, but it must never silently bypass authentication, ownership, approval, provider readiness, evidence, or production-health gates.

## Future expansion

The kernel is designed to host additional deterministic capabilities: failure classification, repair-plan synthesis, dependency impact analysis, regression selection, artifact provenance, release scoring, rollback planning, and continuous post-release monitoring. External side effects remain separately gated and fail-closed.
