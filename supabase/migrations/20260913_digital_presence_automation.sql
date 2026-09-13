-- Digital Presence Automation
-- Ownership is always tied to auth.uid(); secrets/tokens are intentionally excluded.

create table if not exists public.digital_presence_projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  industry text not null,
  market text,
  language text not null default 'id-ID',
  status text not null default 'draft' check (status in ('draft','researching','generating','review','ready','published','archived')),
  brief jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.seo_keywords (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.digital_presence_projects(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  keyword text not null,
  funnel_stage text not null check (funnel_stage in ('TOFU','MOFU','BOFU')),
  intent text,
  source text,
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.serp_observations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.digital_presence_projects(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  query text not null,
  rank integer,
  title text,
  url text not null,
  snippet text,
  provider text not null,
  retrieved_at timestamptz not null default now(),
  evidence jsonb not null default '{}'::jsonb
);

create table if not exists public.social_connections (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.digital_presence_projects(id) on delete cascade,
  provider text not null check (provider in ('meta','instagram','facebook','tiktok','pinterest','youtube','linkedin')),
  external_asset_id text,
  scopes text[] not null default '{}',
  status text not null default 'pending' check (status in ('pending','connected','expired','revoked','error')),
  token_expires_at timestamptz,
  last_verified_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.social_content (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.digital_presence_projects(id) on delete cascade,
  channel text not null,
  content_type text not null,
  title text,
  body text,
  media_brief jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft','review','approved','queued','published','blocked','failed')),
  scheduled_at timestamptz,
  external_publication_id text,
  external_url text,
  published_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.social_publish_jobs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  content_id uuid not null references public.social_content(id) on delete cascade,
  connection_id uuid references public.social_connections(id) on delete set null,
  mode text not null default 'semi_auto' check (mode in ('auto','semi_auto','manual')),
  status text not null default 'queued' check (status in ('queued','running','published','failed','blocked','cancelled')),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  provider_response jsonb not null default '{}'::jsonb,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists digital_presence_projects_owner_idx on public.digital_presence_projects(owner_id);
create index if not exists seo_keywords_project_idx on public.seo_keywords(project_id);
create index if not exists seo_keywords_owner_idx on public.seo_keywords(owner_id);
create index if not exists serp_observations_project_idx on public.serp_observations(project_id);
create index if not exists social_connections_project_idx on public.social_connections(project_id);
create index if not exists social_content_project_idx on public.social_content(project_id);
create index if not exists social_publish_jobs_content_idx on public.social_publish_jobs(content_id);

alter table public.digital_presence_projects enable row level security;
alter table public.digital_presence_projects force row level security;
alter table public.seo_keywords enable row level security;
alter table public.seo_keywords force row level security;
alter table public.serp_observations enable row level security;
alter table public.serp_observations force row level security;
alter table public.social_connections enable row level security;
alter table public.social_connections force row level security;
alter table public.social_content enable row level security;
alter table public.social_content force row level security;
alter table public.social_publish_jobs enable row level security;
alter table public.social_publish_jobs force row level security;

create policy digital_presence_projects_owner_select on public.digital_presence_projects for select to authenticated using ((select auth.uid()) = owner_id);
create policy digital_presence_projects_owner_insert on public.digital_presence_projects for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy digital_presence_projects_owner_update on public.digital_presence_projects for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy digital_presence_projects_owner_delete on public.digital_presence_projects for delete to authenticated using ((select auth.uid()) = owner_id);

create policy seo_keywords_owner_select on public.seo_keywords for select to authenticated using ((select auth.uid()) = owner_id);
create policy seo_keywords_owner_insert on public.seo_keywords for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy seo_keywords_owner_update on public.seo_keywords for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy seo_keywords_owner_delete on public.seo_keywords for delete to authenticated using ((select auth.uid()) = owner_id);

create policy serp_observations_owner_select on public.serp_observations for select to authenticated using ((select auth.uid()) = owner_id);
create policy serp_observations_owner_insert on public.serp_observations for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy serp_observations_owner_update on public.serp_observations for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy serp_observations_owner_delete on public.serp_observations for delete to authenticated using ((select auth.uid()) = owner_id);

create policy social_connections_owner_select on public.social_connections for select to authenticated using ((select auth.uid()) = owner_id);
create policy social_connections_owner_insert on public.social_connections for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy social_connections_owner_update on public.social_connections for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy social_connections_owner_delete on public.social_connections for delete to authenticated using ((select auth.uid()) = owner_id);

create policy social_content_owner_select on public.social_content for select to authenticated using ((select auth.uid()) = owner_id);
create policy social_content_owner_insert on public.social_content for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy social_content_owner_update on public.social_content for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy social_content_owner_delete on public.social_content for delete to authenticated using ((select auth.uid()) = owner_id);

create policy social_publish_jobs_owner_select on public.social_publish_jobs for select to authenticated using ((select auth.uid()) = owner_id);
create policy social_publish_jobs_owner_insert on public.social_publish_jobs for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy social_publish_jobs_owner_update on public.social_publish_jobs for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy social_publish_jobs_owner_delete on public.social_publish_jobs for delete to authenticated using ((select auth.uid()) = owner_id);
