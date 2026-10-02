create table if not exists public.factory_build_evidence (
  id uuid primary key default gen_random_uuid(),
  build_id text not null,
  release_candidate_id text not null,
  execution_id text not null references public.factory_execution_runs(execution_id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  organization_id text not null,
  status text not null check (status in ('passed','failed')),
  build_engine_version text not null,
  candidate_hash text not null,
  quality_evidence_hash text not null,
  artifact_ids text[] not null default '{}',
  artifact_hashes jsonb not null default '[]'::jsonb,
  source_revision text not null,
  package_fingerprint text not null,
  built_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (owner_id, build_id)
);

create index if not exists factory_build_evidence_owner_idx on public.factory_build_evidence(owner_id);
create index if not exists factory_build_evidence_candidate_idx on public.factory_build_evidence(release_candidate_id);
create index if not exists factory_build_evidence_execution_idx on public.factory_build_evidence(execution_id);
create index if not exists factory_build_evidence_fingerprint_idx on public.factory_build_evidence(package_fingerprint);

alter table public.factory_build_evidence enable row level security;
alter table public.factory_build_evidence force row level security;

create policy factory_build_evidence_owner_select on public.factory_build_evidence
  for select to authenticated using ((select auth.uid()) = owner_id);
create policy factory_build_evidence_owner_insert on public.factory_build_evidence
  for insert to authenticated with check ((select auth.uid()) = owner_id);
