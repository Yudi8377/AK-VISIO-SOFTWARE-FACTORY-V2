import { NextResponse } from 'next/server'

export const dynamic = 'force-static'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    automation: {
      internalGeneration: true,
      liveSerpResearch: false,
      externalPublishing: false,
    },
    providers: [
      {
        provider: 'serp',
        configured: false,
        ready: false,
        missing: ['runtime SERP provider binding'],
        capabilities: ['live SERP observations', 'rank/title/source capture', 'keyword evidence provenance'],
      },
      {
        provider: 'meta',
        configured: false,
        ready: false,
        missing: ['runtime Meta OAuth binding'],
        capabilities: ['OAuth connection', 'authorized Facebook Page discovery', 'Instagram professional asset discovery', 'publishing authorization'],
      },
    ],
    policy: {
      accountCreation: 'MANUAL',
      externalPublishing: 'SEMI_AUTO',
      internalGeneration: 'AUTO',
    },
    checkedAt: new Date().toISOString(),
  })
}
