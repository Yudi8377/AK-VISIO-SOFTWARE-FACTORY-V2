-- Release candidates are evidence-linked and owner-scoped.
-- Candidate eligibility never equals production authorization.

create table if not exists public.factory_release_candidates (
  id uuid primary key default gen_random_uuid(),
  release_candidate_id text not null,
  execution_id text not null references public.factory_execution_runs(execution_id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  organization_id text not null,
  artifact_ids text[] not null default '{}',
  quality_evidence_id text not null,
  quality_evidence_hash text not null,
  status text not null check (status in ('eligible','blocked')),
  build_status text not null check (build_status in ('not-started','passed','failed')),
  release_engine_version text not null,
  candidate_hash text not null,
  created_at timestamptz not null default now(),
  unique (owner_id, release_candidate_id)
);

create index if not exists factory_release_candidates_owner_idx on public.factory_release_candidates(owner_id);
create index if not exists factory_release_candidates_execution_idx on public.factory_release_candidates(execution_id);
create index if not exists factory_release_candidates_status_idx on public.factory_release_candidates(status);

alter table public.factory_release_candidates enable row level security;
alter table public.factory_release_candidates force row level security;

create policy factory_release_candidates_owner_select on public.factory_release_candidates
  for select to authenticated using ((select auth.uid()) = owner_id);
create policy factory_release_candidates_owner_insert on public.factory_release_candidates
  for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy factory_release_candidates_owner_update on public.factory_release_candidates
  for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
