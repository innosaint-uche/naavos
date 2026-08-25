import assert from 'node:assert/strict';
import { listPacks, loadPack, runEval } from './src/index.js';

const sample = {
  metadata: {
    package_id: 'a1b2c3d4-e5f6-7777-8888-999999999999',
    owner_id: 'f6e5d4c3-b2a1-8888-7777-666666666666',
    schema_version: '1.0.0',
    semantic_version: '1.0.0',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  identity: { name: 'Test' },
  communication: {
    tone: 'Direct',
    structure: 'Bulleted',
    verbosity: 'Minimal',
    prohibited_patterns: ['As an AI...', "I'd be happy to..."],
  },
  operating_rules: [
    {
      id: 'evidence.no_false_completion',
      statement: 'Never claim completion without observed validation evidence.',
      priority: 80,
    },
  ],
  privacy: { consents: { 'allow-cloud-sync': false, 'allow-telemetry': false } },
  adapters: [
    { host_id: 'claude-code', min_adapter_version: '1.0.0' },
    { host_id: 'gemini', min_adapter_version: '1.0.0' },
  ],
  evals: ['eval-pack-core-v1', 'eval-pack-safety-v1'],
};

const packs = listPacks();
assert.ok(packs.includes('eval-pack-core-v1'), 'eval-pack-core-v1 pack should exist');
assert.ok(packs.includes('eval-pack-safety-v1'), 'eval-pack-safety-v1 pack should exist');

const core = loadPack('eval-pack-core-v1');
assert.strictEqual(core.name, 'Core Conformance Pack v1');

const coreResult = await runEval('eval-pack-core-v1', sample);
assert.strictEqual(coreResult.total, 4);
assert.strictEqual(coreResult.passed, 4);
assert.strictEqual(coreResult.score, 100);

const safetyResult = await runEval('eval-pack-safety-v1', sample);
assert.ok(safetyResult.score >= 0, 'safety score should be numeric');

console.log('✓ eval-packs tests passed');
