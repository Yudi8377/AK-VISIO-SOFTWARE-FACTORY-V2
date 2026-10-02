import { NextResponse } from 'next/server'
import { createServerSupabaseAdminClient } from '@/lib/supabase-server'
import { verifyDeployment } from '@/lib/enterprise/verification'
import { assertTrustedRecoveryInvocation } from '@/lib/enterprise/recovery'
import { getTrustedRecoveryContext, persistDeploymentVerification, persistDeploymentState } from '@/lib/enterprise/release-deployment-repository'
import { assertDeploymentTransition, computeDeploymentStateHash } from '@/lib/enterprise/deployment-state'
import { createRecoveryIncidentKey } from '@/lib/enterprise/self-healing'
import { markRecoveryFailure, markRecoveryRecovered } from '@/lib/enterprise/self-healing-repository'

export async function POST(request: Request) {
  try { assertTrustedRecoveryInvocation(process.env.AUTONOMOUS_RECOVERY_SECRET, request.headers.get('x-autonomous-recovery-secret')) }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'trusted_recovery_invocation_required' }, { status: 401 }) }

  const body = await request.json().catch(() => null)
  if (!body?.ownerId || !body?.deploymentId) return NextResponse.json({ error: 'ownerId and deploymentId are required' }, { status: 400 })

  const supabase = createServerSupabaseAdminClient()
  const { data: evidenceRow, error } = await supabase.from('factory_deployment_evidence').select('*').eq('owner_id', String(body.ownerId)).eq('deployment_id', String(body.deploymentId)).maybeSingle()
  if (error || !evidenceRow) return NextResponse.json({ error: 'deployment_not_found' }, { status: 404 })
  const { data: stateRow, error: stateError } = await supabase.from('factory_deployment_state').select('*').eq('owner_id', String(body.ownerId)).eq('deployment_id', String(body.deploymentId)).order('changed_at', { ascending: false }).limit(1).maybeSingle()
  if (stateError || !stateRow || stateRow.state !== 'provider_accepted') return NextResponse.json({ error: 'deployment_not_ready_for_verification' }, { status: 422 })

  const result = await verifyDeployment({ deploymentId: String(body.deploymentId), providerReference: String(evidenceRow.provider_reference) })
  await persistDeploymentVerification(String(body.ownerId), String(body.deploymentId), result)

  const incidentKey = evidenceRow.action === 'rollback' && evidenceRow.recovery_incident_key ? String(evidenceRow.recovery_incident_key) : null
  if (result.status !== 'passed') {
    await persistDeploymentState({
      deploymentId: String(body.deploymentId), ownerId: String(body.ownerId), organizationId: String(evidenceRow.organization_id), environment: String(evidenceRow.environment),
      state: 'failed', previousState: 'provider_accepted', transitionAction: 'fail', evidenceHash: result.evidenceHash,
      stateHash: computeDeploymentStateHash({ deploymentId: String(body.deploymentId), state: 'failed', action: 'fail', evidenceHash: result.evidenceHash, changedAt: result.checkedAt }),
    })
    if (incidentKey) await markRecoveryFailure(String(body.ownerId), incidentKey, '', `recovery_verification_${result.status}`)
    return NextResponse.json({ verified: false, verification: result }, { status: 502 })
  }

  const verifiedState = assertDeploymentTransition('provider_accepted', 'verify')
  await persistDeploymentState({
    deploymentId: String(body.deploymentId), ownerId: String(body.ownerId), organizationId: String(evidenceRow.organization_id), environment: String(evidenceRow.environment),
    state: verifiedState, previousState: 'provider_accepted', transitionAction: 'verify', evidenceHash: result.evidenceHash,
    stateHash: computeDeploymentStateHash({ deploymentId: String(body.deploymentId), state: verifiedState, action: 'verify', evidenceHash: result.evidenceHash, changedAt: result.checkedAt }),
  })

  if (evidenceRow.action === 'rollback') {
    const rolledBack = assertDeploymentTransition(verifiedState, 'rollback')
    await persistDeploymentState({
      deploymentId: String(body.deploymentId), ownerId: String(body.ownerId), organizationId: String(evidenceRow.organization_id), environment: String(evidenceRow.environment),
      state: rolledBack, previousState: verifiedState, transitionAction: 'rollback', evidenceHash: result.evidenceHash,
      stateHash: computeDeploymentStateHash({ deploymentId: String(body.deploymentId), state: rolledBack, action: 'rollback', evidenceHash: result.evidenceHash, changedAt: result.checkedAt }),
    })
  }

  if (incidentKey) await markRecoveryRecovered(String(body.ownerId), incidentKey, String(body.deploymentId))
  return NextResponse.json({ verified: true, verification: result })
}
