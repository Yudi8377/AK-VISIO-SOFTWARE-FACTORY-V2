const base = process.env.AUDIT_LEDGER_BASE_URL || 'http://127.0.0.1:3000'
const response = await fetch(new URL('/api/factory/audit-events', base), { redirect: 'manual' })
const body = await response.text()
if (response.status !== 401 || !body.includes('"error":"authentication_required"')) {
  throw new Error('audit ledger endpoint must require authentication: ' + response.status + ' ' + body)
}
console.log(JSON.stringify({ status: 'ok', base, authentication: 'required' }))
