-- Digital Presence publish-job safety state.
-- Mirrors the production hardening applied to Supabase project nluvwcroomzunjhzdgxh.
-- Publishing must remain fail-closed until approval and provider verification are satisfied.

alter table public.social_publish_jobs
  add column if not exists approval_state text not null default 'pending' check (approval_state in ('pending','approved','rejected')),
  add column if not exists idempotency_key text,
  add column if not exists provider_status text not null default 'unverified' check (provider_status in ('unverified','verified','failed')),
  add column if not exists verified_at timestamptz,
  add column if not exists verification_evidence jsonb not null default '{}'::jsonb;

create unique index if not exists social_publish_jobs_owner_idempotency_uidx
  on public.social_publish_jobs(owner_id, idempotency_key)
  where idempotency_key is not null;

create index if not exists social_publish_jobs_approval_status_idx
  on public.social_publish_jobs(approval_state, status);

create index if not exists social_publish_jobs_provider_status_idx
  on public.social_publish_jobs(provider_status, status);

alter table public.social_publish_jobs
  add constraint social_publish_jobs_approval_consistency_chk
  check (
    status not in ('published')
    or (approval_state = 'approved' and provider_status = 'verified' and verified_at is not null)
  );
