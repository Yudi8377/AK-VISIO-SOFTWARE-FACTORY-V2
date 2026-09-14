import assert from 'node:assert/strict'
import { buildRunIdempotencyKey, computeRepairBudget, decideNextAction, isValidStageTransition } from './factory-autonomy.ts'

const base = { repairAttempts: 0, approvalGranted: true, productionHealthy: true }
const evidence = (stage: any, status: any = 'PASSED', confidence = 1, failures: string[] = []) => ({ stage, status, confidence, checks: ['verified'], failures })

assert.equal(decideNextAction({ ...base, stage: 'REQUEST', evidence: [evidence('REQUEST')] }).action, 'PLAN')
assert.equal(decideNextAction({ ...base, stage: 'PLANNER', evidence: [evidence('PLANNER')] }).action, 'GENERATE')
assert.equal(decideNextAction({ ...base, stage: 'GENERATOR', evidence: [evidence('GENERATOR')] }).action, 'TEST')
assert.equal(decideNextAction({ ...base, stage: 'TEST', evidence: [evidence('TEST')] }).action, 'VALIDATE')
assert.equal(decideNextAction({ ...base, stage: 'TEST', evidence: [evidence('TEST', 'FAILED', 0, ['compile'])] }).action, 'REPAIR')
assert.equal(decideNextAction({ ...base, stage: 'TEST', repairAttempts: 3, evidence: [evidence('TEST', 'FAILED', 0, ['compile'])] }).action, 'BLOCK')
assert.equal(decideNextAction({ ...base, stage: 'VALIDATOR', evidence: [evidence('VALIDATOR')] }).action, 'GO_LIVE')
assert.equal(decideNextAction({ ...base, stage: 'VALIDATOR', approvalGranted: false, evidence: [evidence('VALIDATOR')] }).action, 'BLOCK')
assert.equal(decideNextAction({ ...base, stage: 'REQUEST', productionHealthy: false, evidence: [evidence('REQUEST')] }).action, 'BLOCK')
assert.equal(isValidStageTransition('REQUEST', 'PLANNER'), true)
assert.equal(isValidStageTransition('REQUEST', 'GENERATOR'), false)
assert.deepEqual(computeRepairBudget(1, 3), { allowed: true, remaining: 2 })
assert.deepEqual(computeRepairBudget(3, 3), { allowed: false, remaining: 0 })
assert.equal(buildRunIdempotencyKey(' owner ', ' req-1 ', 'TEST'), 'owner:req-1:TEST')
console.log('factory autonomy contracts: PASS')
