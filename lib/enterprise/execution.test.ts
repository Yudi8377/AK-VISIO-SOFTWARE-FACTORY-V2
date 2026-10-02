import assert from 'node:assert/strict'
import { ArtifactRegistry } from './artifact-registry.ts'
import { executeGeneration } from './execution.ts'

const result = executeGeneration({
  prompt: 'Build a travel company operating platform',
  organizationId: 'akvisio',
  requestedTargets: ['web', 'pwa', 'android'],
})

assert.equal(result.status, 'completed')
assert.equal(result.artifacts.length, 8)
assert.equal(new Set(result.artifacts.map(item => item.type)).size, 8)
assert.ok(result.artifacts.every(item => item.status === 'generated'))
assert.ok(result.artifacts.every(item => item.contentHash.length === 64))

const registry = new ArtifactRegistry()
for (const artifact of result.artifacts) registry.register(artifact)
assert.equal(registry.list().length, 8)

const first = registry.list()[0]
registry.transition(first.artifactId, 'review', 'automated contract generation complete')
registry.transition(first.artifactId, 'approved', 'low-risk automated approval')
registry.transition(first.artifactId, 'released', 'release gate satisfied')
assert.equal(registry.get(first.artifactId)?.status, 'released')
assert.equal(registry.transitions().length, 3)

const blocked = executeGeneration({
  prompt: 'Build a high-risk system',
  organizationId: 'akvisio',
  risk: 'critical',
})
assert.equal(blocked.status, 'blocked')
assert.equal(blocked.artifacts.length, 0)
assert.equal(blocked.policy.requiresHumanApproval, true)

console.log('factory execution + artifact registry contracts: PASS')
