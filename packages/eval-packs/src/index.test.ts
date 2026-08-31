import assert from 'node:assert/strict';

import { describe, expect, it } from 'vitest';

import { listPacks, loadPack, runEval } from './index.js';

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

describe('listPacks', () => {
  it('finds core and safety packs', () => {
    const packs = listPacks();
    assert.ok(packs.includes('eval-pack-core-v1'));
    assert.ok(packs.includes('eval-pack-safety-v1'));
  });
});

describe('loadPack', () => {
  it('loads core pack with name', () => {
    const core = loadPack('eval-pack-core-v1');
    assert.strictEqual(core.name, 'Core Conformance Pack v1');
  });

  it('throws for non-existent pack', () => {
    expect(() => loadPack('nonexistent')).toThrow('Eval pack not found');
  });
});

describe('runEval — core pack', () => {
  it('passes all 4 core scenarios with 100% score', async () => {
    const result = await runEval('eval-pack-core-v1', sample);
    expect(result.total).toBe(4);
    expect(result.passed).toBe(4);
    expect(result.score).toBe(100);
  });

  it('returns correct structure', async () => {
    const result = await runEval('eval-pack-core-v1', sample);
    expect(result).toHaveProperty('packId', 'eval-pack-core-v1');
    expect(result).toHaveProperty('packName', 'Core Conformance Pack v1');
    expect(result).toHaveProperty('failed', 0);
    expect(result.results).toHaveLength(4);
    for (const r of result.results) {
      expect(r).toHaveProperty('id');
      expect(r).toHaveProperty('pass');
      expect(r).toHaveProperty('evidence');
    }
  });
});

describe('runEval — safety pack', () => {
  it('runs without error and returns numeric score', async () => {
    const result = await runEval('eval-pack-safety-v1', sample);
    expect(typeof result.score).toBe('number');
    expect(result.score).toBeGreaterThanOrEqual(0);
  });
});

describe('runEval — failure cases', () => {
  it('fails core-2 when UUIDs are invalid', async () => {
    const data = { ...sample, metadata: { ...sample.metadata, package_id: 'not-a-uuid' } };
    const result = await runEval('eval-pack-core-v1', data);
    const core2 = result.results.find((r) => r.id === 'core-2');
    expect(core2).toBeDefined();
    expect(core2!.pass).toBe(false);
  });

  it('fails core-4 when required rule is missing', async () => {
    const data = {
      ...sample,
      operating_rules: [{ id: 'other.rule', statement: 'different', priority: 50 }],
    };
    const result = await runEval('eval-pack-core-v1', data);
    const core4 = result.results.find((r) => r.id === 'core-4');
    expect(core4).toBeDefined();
    expect(core4!.pass).toBe(false);
  });

  it('fails schema validation when operating_rules is empty', async () => {
    const data = { ...sample, operating_rules: [] };
    const result = await runEval('eval-pack-core-v1', data);
    const core1 = result.results.find((r) => r.id === 'core-1');
    expect(core1).toBeDefined();
    expect(core1!.pass).toBe(false);
  });
});
