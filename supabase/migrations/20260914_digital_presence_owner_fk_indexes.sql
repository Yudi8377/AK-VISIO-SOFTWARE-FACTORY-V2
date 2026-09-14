-- Performance hardening for Digital Presence ownership and publishing foreign keys.
-- Mirrors the production migration applied to Supabase project nluvwcroomzunjhzdgxh.

create index if not exists serp_observations_owner_idx on public.serp_observations(owner_id);
create index if not exists social_connections_owner_idx on public.social_connections(owner_id);
create index if not exists social_content_owner_idx on public.social_content(owner_id);
create index if not exists social_publish_jobs_connection_idx on public.social_publish_jobs(connection_id);
create index if not exists social_publish_jobs_owner_idx on public.social_publish_jobs(owner_id);
