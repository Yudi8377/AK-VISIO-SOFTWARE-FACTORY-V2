export type ProviderStatus = {
  provider: 'serp' | 'meta'
  configured: boolean
  ready: boolean
  missing: string[]
  capabilities: string[]
}

function present(value: string | undefined) {
  return Boolean(value && value.trim())
}

export function getProviderStatuses(): ProviderStatus[] {
  const serpKey = process.env.SERP_API_KEY
  const serpUrl = process.env.SERP_API_URL
  const metaAppId = process.env.META_APP_ID
  const metaAppSecret = process.env.META_APP_SECRET
  const metaRedirect = process.env.META_REDIRECT_URI

  return [
    {
      provider: 'serp',
      configured: present(serpKey) && present(serpUrl),
      ready: present(serpKey) && present(serpUrl),
      missing: [
        !present(serpUrl) ? 'SERP_API_URL' : '',
        !present(serpKey) ? 'SERP_API_KEY' : '',
      ].filter(Boolean),
      capabilities: ['live SERP observations', 'rank/title/source capture', 'keyword evidence provenance'],
    },
    {
      provider: 'meta',
      configured: present(metaAppId) && present(metaAppSecret) && present(metaRedirect),
      ready: present(metaAppId) && present(metaAppSecret) && present(metaRedirect),
      missing: [
        !present(metaAppId) ? 'META_APP_ID' : '',
        !present(metaAppSecret) ? 'META_APP_SECRET' : '',
        !present(metaRedirect) ? 'META_REDIRECT_URI' : '',
      ].filter(Boolean),
      capabilities: ['OAuth connection', 'authorized Facebook Page discovery', 'Instagram professional asset discovery', 'publishing authorization'],
    },
  ]
}
