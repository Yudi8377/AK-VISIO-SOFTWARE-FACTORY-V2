import { strict as assert } from 'node:assert'
import { evaluatePolicy } from './policy.ts'

assert.equal(evaluatePolicy('payment_execution', 'critical').allowed, false)
assert.equal(evaluatePolicy('payment_execution', 'critical').requiresHumanApproval, true)
assert.equal(evaluatePolicy('payment_execution', 'critical', true).allowed, true)
assert.equal(evaluatePolicy('read_customer', 'low').allowed, true)

console.log('Enterprise policy contract: PASS')
