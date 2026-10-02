const base = process.env.PRODUCTION_BASE_URL || 'https://ak-visio-software-factory-v2.dwahyudi8377.workers.dev'

const checks = [
  { path: '/api/health', status: 200, includes: ['"status":"ok"', '"service":"ak-visio-software-factory-v2"'] },
  { path: '/api/digital-presence/status', status: 200, includes: ['"status":"ok"', '"internalGeneration":true', '"liveSerpResearch":false', '"externalPublishing":false'] },
  { path: '/', status: 200, includes: ['AK VISIO', 'SOFTWARE FACTORY V2'] },
  { path: '/recovery', status: 308, includes: [] },
  { path: '/api/factory/recovery-incidents', status: 401, includes: ['"error":"authentication_required"'] },
]

const failures = []
for (const check of checks) {
  const url = new URL(check.path, base).toString()
  const response = await fetch(url, { redirect: 'manual' })
  const body = await response.text()
  const ok = response.status === check.status && check.includes.every((marker) => body.includes(marker))
  if (response.status !== check.status) failures.push(check.path + ': expected ' + check.status + ', got ' + response.status)
  for (const marker of check.includes) if (!body.includes(marker)) failures.push(check.path + ': missing marker ' + marker)
  console.log(JSON.stringify({ path: check.path, status: response.status, expected: check.status, ok }))
}

if (failures.length) {
  console.error(failures.join('\\n'))
  process.exit(1)
}

console.log(JSON.stringify({ status: 'ok', base, checks: checks.length }))
