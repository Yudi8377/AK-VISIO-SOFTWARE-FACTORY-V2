import { signDeploymentRequest } from './deployment.ts'

export type ProviderDeploymentResult = {
  accepted: boolean
  provider: string
  providerReference: string
  message?: string
}

export async function executeWebhookProvider(input: {
  body: Record<string, unknown>
  webhookUrl: string
  webhookSecret: string
}): Promise<ProviderDeploymentResult> {
  const payload = JSON.stringify(input.body)
  const signature = signDeploymentRequest(payload, input.webhookSecret)
  const response = await fetch(input.webhookUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-deployment-signature': signature,
      'x-deployment-engine-version': String(input.body.deploymentEngineVersion ?? 'unknown'),
    },
    body: payload,
  })
  const text = await response.text()
  if (!response.ok) return { accepted: false, provider: 'webhook', providerReference: 'http-' + response.status, message: text.slice(0, 500) || 'provider_rejected_request' }
  return { accepted: true, provider: 'webhook', providerReference: text.slice(0, 500) || response.headers.get('x-deployment-id') || 'accepted' }
}

export async function executeConfiguredProvider(input: {
  body: Record<string, unknown>
  webhookUrl: string
  webhookSecret: string
}): Promise<ProviderDeploymentResult> {
  const provider = process.env.DEPLOYMENT_PROVIDER || 'webhook'
  if (provider !== 'webhook') return { accepted: false, provider, providerReference: 'unsupported-provider', message: 'deployment_provider_not_supported' }
  return executeWebhookProvider(input)
}
