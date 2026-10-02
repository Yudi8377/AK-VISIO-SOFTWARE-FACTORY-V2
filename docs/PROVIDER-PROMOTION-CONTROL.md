# Provider Deployment Adapter & Promotion Control

The deployment plane separates:
1. Governed deployment request: candidate, build, approval and lineage are validated.
2. Provider adapter: execution is isolated behind a small adapter contract.
3. Promotion control: promotion requires successful deployment evidence in the expected environment.

The current supported provider adapter is the signed webhook provider.

Provider credentials remain server-only. No provider secret is accepted from an HTTP request body.

Promotion requires action=deploy, status=succeeded, expected environment match, and a provider reference for production. Rollback remains separate and requires an explicit target deployment ID.
