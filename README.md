# AK VISIO Software Factory V2

Standalone software factory control plane for REQUEST → PLANNER → GENERATOR → TEST → SELF-HEALING → RE-TEST → VALIDATOR → GO-LIVE.

## Product
Operational workspace for requests, runs, generated projects, repairs, validation and audit history.

## Isolation
V2 uses its own GitHub repository and dedicated Supabase project. It is intentionally isolated from ADTRAN Realindo.

## Local engine
The hardened local factory engine lives under `E:\AK-VISIO-SOFTWARE-FACTORY-V2` and has passed the V2 E2E and hardening gates.
