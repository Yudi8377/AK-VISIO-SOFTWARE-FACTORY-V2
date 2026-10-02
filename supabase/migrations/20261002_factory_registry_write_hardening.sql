-- Registry writes are server-only. Authenticated clients retain owner-scoped read access.
revoke insert, update, delete on table public.factory_execution_runs from anon, authenticated;
revoke insert, update, delete on table public.factory_artifacts from anon, authenticated;
revoke insert, update, delete on table public.factory_quality_evidence from anon, authenticated;
revoke insert, update, delete on table public.factory_release_candidates from anon, authenticated;
revoke insert, update, delete on table public.factory_build_evidence from anon, authenticated;

drop policy if exists factory_execution_runs_owner_insert on public.factory_execution_runs;
drop policy if exists factory_execution_runs_owner_update on public.factory_execution_runs;
drop policy if exists factory_artifacts_owner_insert on public.factory_artifacts;
drop policy if exists factory_artifacts_owner_update on public.factory_artifacts;
drop policy if exists factory_quality_evidence_owner_insert on public.factory_quality_evidence;
drop policy if exists factory_quality_evidence_owner_update on public.factory_release_candidates;
drop policy if exists factory_release_candidates_owner_insert on public.factory_release_candidates;
drop policy if exists factory_release_candidates_owner_update on public.factory_build_evidence;

drop policy if exists factory_build_evidence_owner_select on public.factory_build_evidence;
create policy factory_build_evidence_owner_select on public.factory_build_evidence
  for select to authenticated using ((select auth.uid()) = owner_id);
