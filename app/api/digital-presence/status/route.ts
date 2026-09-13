import { NextResponse } from 'next/server'
import { getProviderStatuses } from '@/lib/digital-presence/provider-status'

export const dynamic = 'force-dynamic'

export async function GET() {
  const providers = getProviderStatuses()
  return NextResponse.json({
    status: 'ok',
    automation: {
      internalGeneration: true,
      externalPublishing: providers.some((provider) => provider.provider === 'meta' && provider.ready),
      liveSerpResearch: providers.some((provider) => provider.provider === 'serp' && provider.ready),
    },
    providers,
    policy: {
      accountCreation: 'MANUAL',
      externalPublishing: 'SEMI_AUTO',
      internalGeneration: 'AUTO',
    },
    checkedAt: new Date().toISOString(),
  })
}
