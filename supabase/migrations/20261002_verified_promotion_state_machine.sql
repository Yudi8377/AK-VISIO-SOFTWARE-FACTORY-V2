alter table public.factory_deployment_evidence
  add column if not exists verification_status text not null default 'pending'
    check (verification_status in ('pending','passed','failed')),
  add column if not exists verification_reference text not null default 'verification_not_run',
  add column if not exists verified_at timestamptz,
  add column if not exists rollback_target_deployment_id text;

create index if not exists factory_deployment_evidence_target_idx
  on public.factory_deployment_evidence(rollback_target_deployment_id);

create table if not exists public.factory_deployment_state (
  id uuid primary key default gen_random_uuid(),
  deployment_id text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  organization_id text not null,
  environment text not null,
  state text not null check (state in ('requested','provider_accepted','verified','promoted','rolled_back','failed')),
  previous_state text,
  transition_action text not null check (transition_action in ('request','provider_accept','verify','promote','rollback','fail')),
  evidence_hash text not null,
  state_hash text not null,
  changed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (owner_id, deployment_id, state_hash)
);

create index if not exists factory_deployment_state_owner_idx
  on public.factory_deployment_state(owner_id);
create index if not exists factory_deployment_state_deployment_idx
  on public.factory_deployment_state(deployment_id);

alter table public.factory_deployment_state enable row level security;
alter table public.factory_deployment_state force row level security;

revoke all on table public.factory_deployment_state from anon;
revoke insert, update, delete on table public.factory_deployment_state from authenticated;
grant select on table public.factory_deployment_state to authenticated;
grant all on table public.factory_deployment_state to service_role;

create policy factory_deployment_state_owner_select
  on public.factory_deployment_state
  for select to authenticated
  using ((select auth.uid()) = owner_id);

create table if not exists public.factory_promotion_evidence (
  id uuid primary key default gen_random_uuid(),
  promotion_id text not null,
  deployment_id text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  organization_id text not null,
  source_environment text not null,
  target_stage text not null check (target_stage in ('staging','production')),
  decision text not null check (decision in ('promote','blocked')),
  evidence_hash text not null,
  approved_by text,
  created_at timestamptz not null default now(),
  unique (owner_id, promotion_id)
);

alter table public.factory_promotion_evidence enable row level security;
alter table public.factory_promotion_evidence force row level security;

revoke all on table public.factory_promotion_evidence from anon;
revoke insert, update, delete on table public.factory_promotion_evidence from authenticated;
grant select on table public.factory_promotion_evidence to authenticated;
grant all on table public.factory_promotion_evidence to service_role;

create policy factory_promotion_evidence_owner_select
  on public.factory_promotion_evidence
  for select to authenticated
  using ((select auth.uid()) = owner_id);
