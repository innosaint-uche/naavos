import assert from 'node:assert/strict';
import { AvatarPackageSchema } from './src/index.js';

const valid = {
  metadata: {
    package_id: 'a1b2c3d4-e5f6-7777-8888-999999999999',
    owner_id: 'f6e5d4c3-b2a1-8888-7777-666666666666',
    schema_version: '1.0.0',
    semantic_version: '1.0.0',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  identity: { name: 'Test' },
  communication: { tone: 'Direct', structure: 'Bulleted', verbosity: 'Minimal' },
  operating_rules: [{ id: 'r1', statement: 'Be fast', priority: 80 }],
  privacy: { consents: {} },
  adapters: [{ host_id: 'hermes', min_adapter_version: '1.0.0' }],
  evals: [],
};

assert.doesNotThrow(() => AvatarPackageSchema.parse(valid), 'valid package should parse');

const missingRules = { ...valid, operating_rules: [] };
assert.throws(() => AvatarPackageSchema.parse(missingRules), 'missing rules should throw');

const missingAdapters = { ...valid, adapters: [] };
assert.throws(() => AvatarPackageSchema.parse(missingAdapters), 'missing adapters should throw');

console.log('✓ schema tests passed');
