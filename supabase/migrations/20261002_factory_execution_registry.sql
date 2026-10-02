-- Factory Execution Engine + durable Artifact Registry
-- Ownership is enforced by auth.uid(); generated content is scoped to the authenticated owner.

create table if not exists public.factory_execution_runs (
  id uuid primary key default gen_random_uuid(),
  execution_id text not null unique,
  owner_id uuid not null references auth.users(id) on delete cascade,
  organization_id text not null,
  prompt text not null,
  status text not null check (status in ('running','completed','blocked','failed')),
  artifact_count integer not null default 0 check (artifact_count >= 0),
  error_message text,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.factory_artifacts (
  id uuid primary key default gen_random_uuid(),
  artifact_id text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  execution_id text not null references public.factory_execution_runs(execution_id) on delete cascade,
  type text not null,
  business_dna_version text not null,
  status text not null check (status in ('draft','generated','review','approved','released','superseded')),
  risk text not null check (risk in ('low','medium','high','critical')),
  source_refs text[] not null default '{}',
  approval_refs text[] not null default '{}',
  license_refs text[] not null default '{}',
  content_hash text not null,
  content jsonb not null default '{}'::jsonb,
  execution_version text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, artifact_id)
);

create index if not exists factory_execution_runs_owner_idx on public.factory_execution_runs(owner_id);
create index if not exists factory_execution_runs_org_idx on public.factory_execution_runs(organization_id);
create index if not exists factory_artifacts_owner_idx on public.factory_artifacts(owner_id);
create index if not exists factory_artifacts_execution_idx on public.factory_artifacts(execution_id);
create index if not exists factory_artifacts_status_idx on public.factory_artifacts(status);
create index if not exists factory_artifacts_hash_idx on public.factory_artifacts(content_hash);

alter table public.factory_execution_runs enable row level security;
alter table public.factory_execution_runs force row level security;
alter table public.factory_artifacts enable row level security;
alter table public.factory_artifacts force row level security;

create policy factory_execution_runs_owner_select on public.factory_execution_runs
  for select to authenticated using ((select auth.uid()) = owner_id);
create policy factory_execution_runs_owner_insert on public.factory_execution_runs
  for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy factory_execution_runs_owner_update on public.factory_execution_runs
  for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);

create policy factory_artifacts_owner_select on public.factory_artifacts
  for select to authenticated using ((select auth.uid()) = owner_id);
create policy factory_artifacts_owner_insert on public.factory_artifacts
  for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy factory_artifacts_owner_update on public.factory_artifacts
  for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
