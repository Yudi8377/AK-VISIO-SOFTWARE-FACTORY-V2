create table if not exists public.factory_audit_events (
  id uuid primary key default gen_random_uuid(),
  event_id text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  organization_id text not null,
  environment text not null,
  event_type text not null,
  aggregate_type text not null,
  aggregate_id text not null,
  actor_type text not null check (actor_type in ('system','user','scheduler','provider')),
  actor_id text,
  payload jsonb not null default '{}'::jsonb,
  payload_hash text not null,
  previous_event_hash text,
  event_hash text not null,
  occurred_at timestamptz not null default now(),
  unique(owner_id, event_id),
  unique(owner_id, event_hash)
);
alter table public.factory_audit_events enable row level security;
alter table public.factory_audit_events force row level security;
revoke all on table public.factory_audit_events from anon;
revoke insert, update, delete on table public.factory_audit_events from authenticated;
grant select on table public.factory_audit_events to authenticated;
grant all on table public.factory_audit_events to service_role;
create policy factory_audit_events_owner_select on public.factory_audit_events for select to authenticated
  using ((select auth.uid()) = owner_id);
create index if not exists factory_audit_events_scope_idx
  on public.factory_audit_events(owner_id, organization_id, environment, occurred_at desc);
create index if not exists factory_audit_events_aggregate_idx
  on public.factory_audit_events(owner_id, aggregate_type, aggregate_id, occurred_at desc);
