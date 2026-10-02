create table if not exists public.factory_release_approvals (
  id uuid primary key default gen_random_uuid(),
  approval_id text not null,
  release_candidate_id text not null,
  build_id text not null,
  execution_id text not null references public.factory_execution_runs(execution_id) on delete cascade,
  organization_id text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  environment text not null,
  package_fingerprint text not null,
  approved_by text not null,
  status text not null check (status in ('approved','rejected')),
  approval_hash text not null,
  approved_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (owner_id, approval_id)
);
create table if not exists public.factory_deployment_evidence (
  id uuid primary key default gen_random_uuid(),
  deployment_id text not null,
  approval_id text not null,
  release_candidate_id text not null,
  build_id text not null,
  execution_id text not null references public.factory_execution_runs(execution_id) on delete cascade,
  organization_id text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  environment text not null,
  action text not null check (action in ('deploy','rollback')),
  status text not null check (status in ('succeeded','failed')),
  provider text not null,
  provider_reference text not null,
  package_fingerprint text not null,
  request_hash text not null,
  deployment_engine_version text not null,
  started_at timestamptz not null,
  completed_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (owner_id, deployment_id)
);
create index if not exists factory_release_approvals_owner_idx on public.factory_release_approvals(owner_id);
create index if not exists factory_release_approvals_candidate_idx on public.factory_release_approvals(release_candidate_id);
create index if not exists factory_release_approvals_fingerprint_idx on public.factory_release_approvals(package_fingerprint);
create index if not exists factory_deployment_evidence_owner_idx on public.factory_deployment_evidence(owner_id);
create index if not exists factory_deployment_evidence_candidate_idx on public.factory_deployment_evidence(release_candidate_id);
create index if not exists factory_deployment_evidence_fingerprint_idx on public.factory_deployment_evidence(package_fingerprint);
alter table public.factory_release_approvals enable row level security;
alter table public.factory_release_approvals force row level security;
alter table public.factory_deployment_evidence enable row level security;
alter table public.factory_deployment_evidence force row level security;
revoke all on table public.factory_release_approvals from anon;
revoke insert, update, delete on table public.factory_release_approvals from authenticated;
grant select on table public.factory_release_approvals to authenticated;
grant all on table public.factory_release_approvals to service_role;
revoke all on table public.factory_deployment_evidence from anon;
revoke insert, update, delete on table public.factory_deployment_evidence from authenticated;
grant select on table public.factory_deployment_evidence to authenticated;
grant all on table public.factory_deployment_evidence to service_role;
create policy factory_release_approvals_owner_select on public.factory_release_approvals
  for select to authenticated using ((select auth.uid()) = owner_id);
create policy factory_deployment_evidence_owner_select on public.factory_deployment_evidence
  for select to authenticated using ((select auth.uid()) = owner_id);
