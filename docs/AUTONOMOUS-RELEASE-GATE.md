# Autonomous Release Gate

The release gate is the final fail-closed control between verified deployment evidence and release eligibility.

## Required evidence

A release is eligible only when:

1. Deployment state is `verified`.
2. Runtime verification status is `passed`.
3. Provider returned a usable deployment reference.
4. Approval status is `approved`.
5. Approval package fingerprint exactly matches the deployed package.
6. Approval environment exactly matches the requested release environment.

Provider HTTP acceptance alone never grants release eligibility.

## Runtime flow

`requested → provider_accepted → verified → release_gate → promoted`

Any missing or mismatched evidence blocks the release.

## APIs

- `POST /api/factory/verify`
- `GET /api/factory/deployment-state?deploymentId=...`
- `POST /api/factory/release-gate`
- `POST /api/factory/promote`

Rollback remains explicit and requires a previously successful, verified deployment target.
