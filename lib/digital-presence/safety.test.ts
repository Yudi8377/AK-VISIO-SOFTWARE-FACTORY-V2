import {
  buildIdempotencyKey,
  canVerifyPublishedResult,
  calculateRetryDelayMs,
  evaluatePublishPolicy,
  isRetryablePublishFailure,
  redactSecret,
} from './safety'

const ready = { configured: true, ready: true, reasons: [] }
const unavailable = { configured: false, ready: false, reasons: ['provider_not_configured'] }

if (evaluatePublishPolicy({ mode: 'SEMI_AUTO', approval: 'APPROVED', provider: ready, idempotencyKey: 'job:1' }).allowed !== true) {
  throw new Error('approved semi-auto publish should be allowed')
}

for (const input of [
  { mode: 'SEMI_AUTO' as const, approval: 'PENDING' as const, provider: ready, idempotencyKey: 'job:2' },
  { mode: 'AUTO' as const, approval: 'APPROVED' as const, provider: unavailable, idempotencyKey: 'job:3' },
  { mode: 'MANUAL' as const, approval: 'APPROVED' as const, provider: ready, idempotencyKey: 'job:4' },
  { mode: 'SEMI_AUTO' as const, approval: 'APPROVED' as const, provider: ready, idempotencyKey: '' },
]) {
  if (evaluatePublishPolicy(input).allowed !== false) throw new Error('unsafe publish was allowed')
}

if (buildIdempotencyKey(['job', ' 42 ', 'publish']) !== 'job:42:publish') throw new Error('idempotency key normalization failed')
if (!isRetryablePublishFailure(429) || !isRetryablePublishFailure(503) || isRetryablePublishFailure(400)) throw new Error('retry classification failed')
if (!canVerifyPublishedResult('SUCCEEDED') || canVerifyPublishedResult('FAILED')) throw new Error('verification gate failed')
if (redactSecret('abcdefghijklmnop') !== 'abcd***mnop') throw new Error('secret redaction failed')

const delays = Array.from({ length: 20 }, (_, index) => calculateRetryDelayMs(index))
if (delays.some((value) => value < 0 || value > 45000)) throw new Error('retry delay outside safe bounds')

console.log('digital presence safety contracts: PASS')
