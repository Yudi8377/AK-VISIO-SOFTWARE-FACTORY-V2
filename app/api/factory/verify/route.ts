import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getOwnedDeploymentEvidence, getLatestOwnedDeploymentState, persistDeploymentState, persistDeploymentVerification } from '@/lib/enterprise/release-deployment-repository'
import { assertDeploymentTransition, computeDeploymentStateHash } from '@/lib/enterprise/deployment-state'
import { verifyDeployment } from '@/lib/enterprise/verification'

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'authentication_required' }, { status: 401 })
  const body = await request.json().catch(() => null)
  if (!body?.deploymentId) return NextResponse.json({ error: 'deploymentId is required' }, { status: 400 })

  const evidence = await getOwnedDeploymentEvidence(user.id, String(body.deploymentId))
  if (!evidence) return NextResponse.json({ error: 'deployment_not_found' }, { status: 404 })
  const current = await getLatestOwnedDeploymentState(user.id, evidence.deploymentId)
  if (!current || current.state !== 'provider_accepted') return NextResponse.json({ error: 'deployment_not_ready_for_verification' }, { status: 422 })

  const result = await verifyDeployment({ deploymentId: evidence.deploymentId, providerReference: evidence.providerReference })
  await persistDeploymentVerification(user.id, evidence.deploymentId, result)

  if (result.status === 'passed') {
    const next = assertDeploymentTransition(current.state, 'verify')
    const completedAt = result.checkedAt
    await persistDeploymentState({
      deploymentId: evidence.deploymentId, ownerId: user.id, organizationId: evidence.organizationId,
      environment: evidence.environment, state: next, previousState: current.state, transitionAction: 'verify',
      evidenceHash: result.evidenceHash,
      stateHash: computeDeploymentStateHash({ deploymentId: evidence.deploymentId, state: next, action: 'verify', evidenceHash: result.evidenceHash, changedAt: completedAt }),
    })
    if (evidence.action === 'rollback') {
      const rollbackState = assertDeploymentTransition(next, 'rollback')
      await persistDeploymentState({
        deploymentId: evidence.deploymentId, ownerId: user.id, organizationId: evidence.organizationId,
        environment: evidence.environment, state: rollbackState, previousState: next, transitionAction: 'rollback',
        evidenceHash: result.evidenceHash,
        stateHash: computeDeploymentStateHash({ deploymentId: evidence.deploymentId, state: rollbackState, action: 'rollback', evidenceHash: result.evidenceHash, changedAt: completedAt }),
      })
    }
  } else {
    await persistDeploymentState({
      deploymentId: evidence.deploymentId, ownerId: user.id, organizationId: evidence.organizationId,
      environment: evidence.environment, state: 'failed', previousState: current.state, transitionAction: 'fail',
      evidenceHash: result.evidenceHash,
      stateHash: computeDeploymentStateHash({ deploymentId: evidence.deploymentId, state: 'failed', action: 'fail', evidenceHash: result.evidenceHash, changedAt: result.checkedAt }),
    })
  }
  return NextResponse.json({ deploymentId: evidence.deploymentId, verification: result, verified: result.status === 'passed' }, { status: result.status === 'passed' ? 200 : 502 })
}
