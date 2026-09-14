import {
  authorizeRuntimePublish,
  buildRuntimeStatus,
  canMarkProviderVerified,
  canTransitionPublishJob,
  normalizeIdempotencyKey,
} from './runtime-boundary.ts'

const readyProvider = { configured: true, ready: true, reasons: [] }
const unavailableProvider = { configured: false, ready: false, reasons: ['provider_not_ready'] }
const baseRequest = { actor: { userId: 'user-1', authenticated: true }, ownerId: 'user-1', mode: 'SEMI_AUTO' as const, approval: 'APPROVED' as const, provider: readyProvider, jobState: 'QUEUED' as const, idempotencyKey: 'job:123' }

if (!authorizeRuntimePublish(baseRequest).allowed) throw new Error('expected authorized queued publish to pass')
if (authorizeRuntimePublish({ ...baseRequest, actor: { userId: '', authenticated: false } }).reason !== 'authentication_required') throw new Error('expected authentication gate')
if (authorizeRuntimePublish({ ...baseRequest, ownerId: 'user-2' }).reason !== 'owner_mismatch') throw new Error('expected ownership gate')
if (authorizeRuntimePublish({ ...baseRequest, jobState: 'RUNNING' }).reason !== 'job_not_queued') throw new Error('expected queued-state gate')
if (authorizeRuntimePublish({ ...baseRequest, provider: unavailableProvider }).reason !== 'provider_not_ready') throw new Error('expected provider readiness gate')
if (canTransitionPublishJob('QUEUED', 'RUNNING') !== true || canTransitionPublishJob('SUCCEEDED', 'QUEUED') !== false) throw new Error('publish state machine contract failed')
if (canMarkProviderVerified('SUCCEEDED', readyProvider) !== true || canMarkProviderVerified('RUNNING', readyProvider) !== false) throw new Error('provider verification contract failed')
if (normalizeIdempotencyKey('  job:123   retry  ') !== 'job:123 retry') throw new Error('idempotency normalization contract failed')
const status = buildRuntimeStatus()
if (status.failClosed !== true || status.externalPublishingEnabled !== false || status.serpResearchEnabled !== false) throw new Error('runtime status must remain fail-closed')
console.log('digital presence runtime boundary contracts: PASS')
