create index if not exists factory_recovery_evidence_scope_idx
  on public.factory_recovery_evidence(owner_id, organization_id, environment, created_at desc);

create index if not exists factory_deployment_evidence_recovery_target_idx
  on public.factory_deployment_evidence(owner_id, rollback_target_deployment_id, started_at desc);
