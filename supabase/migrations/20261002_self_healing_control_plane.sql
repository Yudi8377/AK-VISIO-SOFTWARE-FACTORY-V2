create table if not exists public.factory_recovery_incidents (
  id uuid primary key default gen_random_uuid(),
  incident_key text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  organization_id text not null,
  environment text not null,
  current_deployment_id text not null,
  target_deployment_id text not null,
  status text not null check (status in ('detected','recovering','recovered','escalated','suppressed')),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  max_attempts integer not null default 3 check (max_attempts between 1 and 10),
  cooldown_until timestamptz,
  lease_until timestamptz,
  lease_token text,
  last_recovery_id text,
  last_error text,
  detected_at timestamptz not null default now(),
  started_at timestamptz,
  resolved_at timestamptz,
  updated_at timestamptz not null default now(),
  incident_hash text not null,
  unique(owner_id, incident_key)
);
alter table public.factory_recovery_incidents enable row level security;
alter table public.factory_recovery_incidents force row level security;
revoke all on table public.factory_recovery_incidents from anon;
revoke insert, update, delete on table public.factory_recovery_incidents from authenticated;
grant select on table public.factory_recovery_incidents to authenticated;
grant all on table public.factory_recovery_incidents to service_role;
create policy factory_recovery_incidents_owner_select on public.factory_recovery_incidents for select to authenticated using ((select auth.uid()) = owner_id);
create index if not exists factory_recovery_incidents_scope_idx on public.factory_recovery_incidents(owner_id, organization_id, environment, updated_at desc);
create index if not exists factory_recovery_incidents_status_idx on public.factory_recovery_incidents(status, cooldown_until, lease_until);