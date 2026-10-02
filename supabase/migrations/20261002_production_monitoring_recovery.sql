create table if not exists public.factory_monitoring_evidence (
  id uuid primary key default gen_random_uuid(), deployment_id text not null, owner_id uuid not null references auth.users(id) on delete cascade,
  organization_id text not null, environment text not null, health text not null check (health in ('healthy','degraded','unhealthy')),
  reason text not null, age_seconds integer not null check (age_seconds >= 0), evidence_hash text not null,
  monitoring_engine_version text not null, checked_at timestamptz not null default now(), created_at timestamptz not null default now(),
  unique (owner_id, deployment_id, evidence_hash)
);
create table if not exists public.factory_recovery_evidence (
  id uuid primary key default gen_random_uuid(), recovery_id text not null, owner_id uuid not null references auth.users(id) on delete cascade,
  organization_id text not null, environment text not null, current_deployment_id text not null, target_deployment_id text not null,
  decision text not null check (decision in ('eligible','blocked')), evidence_hash text not null, created_at timestamptz not null default now(),
  unique (owner_id, recovery_id)
);
alter table public.factory_monitoring_evidence enable row level security;
alter table public.factory_monitoring_evidence force row level security;
alter table public.factory_recovery_evidence enable row level security;
alter table public.factory_recovery_evidence force row level security;
revoke all on table public.factory_monitoring_evidence from anon;
revoke insert, update, delete on table public.factory_monitoring_evidence from authenticated;
grant select on table public.factory_monitoring_evidence to authenticated;
grant all on table public.factory_monitoring_evidence to service_role;
revoke all on table public.factory_recovery_evidence from anon;
revoke insert, update, delete on table public.factory_recovery_evidence from authenticated;
grant select on table public.factory_recovery_evidence to authenticated;
grant all on table public.factory_recovery_evidence to service_role;
create policy factory_monitoring_evidence_owner_select on public.factory_monitoring_evidence for select to authenticated using ((select auth.uid()) = owner_id);
create policy factory_recovery_evidence_owner_select on public.factory_recovery_evidence for select to authenticated using ((select auth.uid()) = owner_id);
create index if not exists factory_monitoring_evidence_deployment_idx on public.factory_monitoring_evidence(deployment_id, checked_at desc);
create index if not exists factory_recovery_evidence_current_idx on public.factory_recovery_evidence(current_deployment_id, created_at desc);
