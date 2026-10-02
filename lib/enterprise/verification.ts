import { createHash } from 'node:crypto'

export type VerificationStatus = 'pending' | 'passed' | 'failed'

export type DeploymentVerificationResult = {
  status: VerificationStatus
  reference: string
  checkedAt: string
  evidenceHash: string
}

export async function verifyDeployment(input: {
  deploymentId: string
  providerReference: string
}): Promise<DeploymentVerificationResult> {
  const checkedAt = new Date().toISOString()
  const verifyUrl = process.env.DEPLOYMENT_VERIFY_URL
  if (!verifyUrl) {
    return {
      status: 'pending',
      reference: 'verification_not_configured',
      checkedAt,
      evidenceHash: createHash('sha256').update(JSON.stringify({ deploymentId: input.deploymentId, providerReference: input.providerReference, status: 'pending' })).digest('hex'),
    }
  }

  try {
    const url = new URL(verifyUrl)
    url.searchParams.set('deploymentId', input.deploymentId)
    const response = await fetch(url, { method: 'GET', cache: 'no-store' })
    const body = await response.text()
    const reference = response.headers.get('x-deployment-verification-reference') || body.slice(0, 500) || 'verified'
    const status: VerificationStatus = response.ok ? 'passed' : 'failed'
    return {
      status,
      reference,
      checkedAt,
      evidenceHash: createHash('sha256').update(JSON.stringify({ deploymentId: input.deploymentId, providerReference: input.providerReference, status, reference })).digest('hex'),
    }
  } catch (error) {
    const reference = error instanceof Error ? error.message : 'verification_failed'
    return {
      status: 'failed',
      reference,
      checkedAt,
      evidenceHash: createHash('sha256').update(JSON.stringify({ deploymentId: input.deploymentId, providerReference: input.providerReference, status: 'failed', reference })).digest('hex'),
    }
  }
}
