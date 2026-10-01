import { strict as assert } from 'node:assert'
import { createBusinessDNA, planGeneration, createArtifact } from './runtime'

const dna = createBusinessDNA({ prompt: 'Build a travel company', organizationId: 'akvisio', requestedTargets: ['web','pwa','android'] })
assert.equal(dna.organization.name, 'AKVISIO')
assert.deepEqual(dna.deploymentTargets, ['web','pwa','android'])

const plan = planGeneration({ prompt: 'Build a travel company', organizationId: 'akvisio' })
assert.equal(plan.stages.length, 10)
assert.equal(plan.policy.allowed, true)

const artifact = createArtifact('public-web-app', dna.version)
assert.equal(artifact.status, 'draft')
assert.equal(artifact.businessDnaVersion, '1.0.0')

console.log('Enterprise runtime contract: PASS')
