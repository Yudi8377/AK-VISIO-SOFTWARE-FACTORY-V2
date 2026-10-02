-- QA/Security Execution Plane evidence registry
-- Evidence is owner-scoped and does not grant release authorization by itself.

create table if not exists public.factory_quality_evidence (
  id uuid primary key default gen_random_uuid(),
  evidence_id text not null,
  execution_id text not null references public.factory_execution_runs(execution_id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  organization_id text not null,
  validator_version text not null,
  status text not null check (status in ('passed','failed')),
  release_candidate_eligible boolean not null default false,
  artifact_ids text[] not null default '{}',
  findings jsonb not null default '[]'::jsonb,
  evidence_hash text not null,
  checked_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (owner_id, evidence_id)
);

create index if not exists factory_quality_evidence_owner_idx on public.factory_quality_evidence(owner_id);
create index if not exists factory_quality_evidence_execution_idx on public.factory_quality_evidence(execution_id);
create index if not exists factory_quality_evidence_status_idx on public.factory_quality_evidence(status);
create index if not exists factory_quality_evidence_hash_idx on public.factory_quality_evidence(evidence_hash);

alter table public.factory_quality_evidence enable row level security;
alter table public.factory_quality_evidence force row level security;

create policy factory_quality_evidence_owner_select on public.factory_quality_evidence
  for select to authenticated using ((select auth.uid()) = owner_id);
create policy factory_quality_evidence_owner_insert on public.factory_quality_evidence
  for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy factory_quality_evidence_owner_update on public.factory_quality_evidence
  for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
