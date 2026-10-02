import { createServerSupabaseAdminClient } from '@/lib/supabase-server'
import { DEFAULT_COOLDOWN_SECONDS, DEFAULT_LEASE_SECONDS, DEFAULT_MAX_RECOVERY_ATTEMPTS, createRecoveryIncidentHash, createRecoveryIncidentKey, newLeaseToken, nextRecoveryWindow, recoveryPolicy } from './self-healing'

export async function acquireRecoveryIncident(input:{ownerId:string;organizationId:string;environment:string;currentDeploymentId:string;targetDeploymentId:string;healthEvidenceHash:string}) {
  const supabase=createServerSupabaseAdminClient()
  const incidentKey=createRecoveryIncidentKey(input)
  const incidentHash=createRecoveryIncidentHash({incidentKey,currentDeploymentId:input.currentDeploymentId,targetDeploymentId:input.targetDeploymentId,healthEvidenceHash:input.healthEvidenceHash})
  const now=new Date()
  const leaseUntil=new Date(now.getTime()+DEFAULT_LEASE_SECONDS*1000).toISOString()
  const leaseToken=newLeaseToken()
  const {data,error}=await supabase.from('factory_recovery_incidents').select('*').eq('owner_id',input.ownerId).eq('incident_key',incidentKey).maybeSingle()
  if(error) throw error
  if(!data){
    const {data:created,error:createError}=await supabase.from('factory_recovery_incidents').insert({
      incident_key:incidentKey,owner_id:input.ownerId,organization_id:input.organizationId,environment:input.environment,
      current_deployment_id:input.currentDeploymentId,target_deployment_id:input.targetDeploymentId,status:'recovering',
      attempt_count:1,max_attempts:DEFAULT_MAX_RECOVERY_ATTEMPTS,lease_until:leaseUntil,lease_token:leaseToken,
      started_at:now.toISOString(),updated_at:now.toISOString(),incident_hash:incidentHash
    }).select('*').maybeSingle()
    if(!createError&&created) return {acquired:true as const,attempt:1,incident:created}
    const retry=await supabase.from('factory_recovery_incidents').select('*').eq('owner_id',input.ownerId).eq('incident_key',incidentKey).maybeSingle()
    if(retry.error) throw retry.error
    if(!retry.data) throw createError
    return {acquired:false as const,reason:'recovery_incident_race'}
  }
  const policy=recoveryPolicy({attemptCount:Number(data.attempt_count),maxAttempts:Number(data.max_attempts),now,cooldownUntil:data.cooldown_until,leaseUntil:data.lease_until})
  if(!policy.allowed) return {acquired:false as const,reason:policy.reason,status:policy.status,incident:data}
  const nextAttempt=Number(data.attempt_count)+1
  const {data:claimed,error:claimError}=await supabase.from('factory_recovery_incidents').update({
    status:'recovering',attempt_count:nextAttempt,lease_until:leaseUntil,lease_token:leaseToken,
    current_deployment_id:input.currentDeploymentId,target_deployment_id:input.targetDeploymentId,
    incident_hash:incidentHash,started_at:now.toISOString(),updated_at:now.toISOString(),last_error:null
  }).eq('owner_id',input.ownerId).eq('incident_key',incidentKey).eq('lease_token',data.lease_token).eq('lease_until',data.lease_until).select('*').maybeSingle()
  if(claimError) throw claimError
  if(!claimed) return {acquired:false as const,reason:'recovery_lease_race'}
  return {acquired:true as const,attempt:nextAttempt,incident:claimed}
}

export async function markRecoveryFailure(ownerId:string,incidentKey:string,leaseToken:string,errorMessage:string) {
  const supabase=createServerSupabaseAdminClient()
  const now=new Date()
  let lookup=supabase.from('factory_recovery_incidents').select('attempt_count,max_attempts').eq('owner_id',ownerId).eq('incident_key',incidentKey)
  if (leaseToken) lookup=lookup.eq('lease_token',leaseToken)
  const {data}=await lookup.maybeSingle()
  if(!data) return
  const attempts=Number(data.attempt_count), max=Number(data.max_attempts)
  const escalated=attempts>=max
  let query=supabase.from('factory_recovery_incidents').update({
    status:escalated?'escalated':'suppressed',cooldown_until:escalated?null:nextRecoveryWindow(now,DEFAULT_COOLDOWN_SECONDS),
    lease_until:null,lease_token:null,last_error:errorMessage.slice(0,2000),updated_at:now.toISOString(),
    resolved_at:escalated?now.toISOString():null
  }).eq('owner_id',ownerId).eq('incident_key',incidentKey)
  if (leaseToken) query=query.eq('lease_token',leaseToken)
  await query
}

export async function markRecoveryStarted(ownerId:string,incidentKey:string,leaseToken:string,recoveryId:string) {
  const supabase=createServerSupabaseAdminClient()
  await supabase.from('factory_recovery_incidents').update({last_recovery_id:recoveryId,updated_at:new Date().toISOString()}).eq('owner_id',ownerId).eq('incident_key',incidentKey).eq('lease_token',leaseToken)
}

export async function markRecoveryRecovered(ownerId:string,incidentKey:string,recoveryId:string) {
  const supabase=createServerSupabaseAdminClient()
  await supabase.from('factory_recovery_incidents').update({status:'recovered',lease_until:null,lease_token:null,last_recovery_id:recoveryId,cooldown_until:null,resolved_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq('owner_id',ownerId).eq('incident_key',incidentKey)
}
