# WP-007 — AK Repo Studio v0.4 Sandbox + Project DNA
Date: 2026-09-26
Status: IMPLEMENTED IN BRANCH
## Objective
Turn an imported ZIP into a non-executing sandbox artifact, derive Project DNA, and produce compatibility findings before any integration.
## Controls
- ZIP extraction is confined to the Repo Studio sandbox.
- Path traversal and absolute/drive paths are rejected.
- File-count, total-size and per-file limits are enforced.
- No dependency installation, network access, production writes or destructive operations.
- Project DNA records stack, runtimes, package managers/lockfiles, entrypoints, tests, CI, configuration, dependency hints, license hints and possible secret-bearing files.
- Compatibility findings are advisory evidence; high-risk secret findings require review.
- Integration remains approval-gated.
## Next
Target-project selection, persisted target DNA, backup/rollback, explicit approval UI, and governed Integration Executor.
