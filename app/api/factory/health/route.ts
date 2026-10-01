import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'ak-visio-software-factory',
    capability: 'enterprise-factory-runtime',
    version: '1.0',
  })
}
