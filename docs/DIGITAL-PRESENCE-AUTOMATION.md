# AK VISIO Digital Presence Automation

## Purpose

Extend the factory from website generation into a governed digital-presence pipeline: research, brand/content generation, SEO, social scheduling, publishing, verification, monitoring, and bounded self-healing.

## Capabilities

### SEO Research Engine
- Accept business, industry, market, language, and seed topics.
- Discover and normalize keywords.
- Classify intent and funnel stage (TOFU/MOFU/BOFU).
- Capture SERP observations only through an approved search provider.
- Store source URL, retrieved time, query, rank, title, and evidence metadata.
- Never invent search volume, competition, ranking position, or competitor facts.

### Meta Integration Engine
- OAuth-based connection only; never collect or store platform passwords.
- Store provider, external asset ID, scopes, token metadata, and verification state.
- Discover authorized Facebook Pages and connected Instagram professional assets.
- Separate account connection from content generation.

### Social Publishing Engine
- Generate channel-specific assets.
- Run content, brand, safety, and policy checks.
- Queue content for manual, semi-automatic, or automatic publishing according to project policy.
- Publish through an approved provider connector.
- Persist external publication ID, status, URL, and timestamps.
- Verify the publication after publishing.

### Governance

Actions are classified as:

- `AUTO`: safe internal generation and validation.
- `SEMI_AUTO`: external publishing after approval or policy gate.
- `MANUAL`: account creation, ownership changes, destructive actions, or missing authorization.

## Target pipeline

REQUEST -> PLANNER -> RESEARCH -> GENERATOR -> SEO -> SOCIAL -> TEST -> SELF-HEAL -> VALIDATOR -> APPROVAL -> DEPLOY -> PUBLISH -> VERIFY -> MONITOR

## Forma Elan reference workload

A single business brief should be able to produce a project containing:

- website sitemap and page copy
- brand positioning and voice
- SEO keyword clusters
- SERP research evidence
- content gap map
- article plan
- FAQ/Article/HowTo schema payloads
- social profile package
- 30-day social content calendar
- channel-specific captions and short-video hooks
- publication queue
- deployment and publication verification records

## Security requirements

- No platform passwords in the application.
- No service-role or secret keys in browser code.
- OAuth tokens are server-side secrets and must be encrypted at rest.
- Requested scopes must be least-privilege.
- Every external write must be auditable.
- Publishing must fail closed when authorization, policy, or verification is missing.
- Search results must retain provenance so generated claims can be traced to evidence.
