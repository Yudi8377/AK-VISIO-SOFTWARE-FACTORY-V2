const base = process.env.SECURITY_HEADERS_BASE_URL || 'http://127.0.0.1:3000'
const response = await fetch(new URL('/api/health', base))
if (response.status !== 200) throw new Error('health endpoint returned ' + response.status)

const expected = {
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()',
}
for (const [name, value] of Object.entries(expected)) {
  const actual = response.headers.get(name)
  if (actual !== value) throw new Error(name + ': expected ' + value + ', got ' + actual)
}
console.log(JSON.stringify({ status: 'ok', base, headers: Object.keys(expected).length }))
