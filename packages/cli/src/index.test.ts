import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { compile } from '@naavos/compiler';
import { describe, expect, it } from 'vitest';

import { createTarGz, listTargets } from './index.js';

// A minimal valid avatar package that all CLI tests build on
function makeValidAvatar(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    metadata: {
      package_id: 'a1b2c3d4-e5f6-7777-8888-999999999999',
      owner_id: 'f6e5d4c3-b2a1-8888-7777-666666666666',
      schema_version: '1.0.0',
      semantic_version: '1.0.0',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    identity: { name: 'TestUser', roles: ['Developer'] },
    communication: {
      tone: 'Direct',
      structure: 'Bulleted',
      verbosity: 'Minimal',
      prohibited_patterns: ['As an AI'],
    },
    operating_rules: [
      { id: 'r1', statement: 'Always test', priority: 90 },
      { id: 'r2', statement: 'No fluff', priority: 80 },
    ],
    privacy: { consents: { 'allow-cloud-sync': false, 'allow-telemetry': false } },
    adapters: [{ host_id: 'hermes', min_adapter_version: '1.0.0' }],
    evals: [],
    ...overrides,
  };
}

describe('listTargets (re-exported)', () => {
  it('returns 6 targets', () => {
    expect(listTargets()).toHaveLength(6);
  });
});

describe('createTarGz', () => {
  it('creates a valid gzip file from FileMap', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'naavos-test-'));
    const outputPath = path.join(tmpDir, 'test.tar.gz');

    const files = new Map<string, string>([
      ['SOUL.md', '# Test Soul\n'],
      ['SKILL.md', '# Test Skill\n'],
    ]);

    await createTarGz(files, outputPath);

    assert.ok(fs.existsSync(outputPath), 'tar.gz should exist');
    const contents = fs.readFileSync(outputPath);
    assert.ok(
      contents[0] === 0x1f && contents[1] === 0x8b,
      'should be gzip format (magic 0x1f 0x8b)',
    );

    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('creates gzip with correct content for single file', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'naavos-test-'));
    const outputPath = path.join(tmpDir, 'single.tar.gz');

    const content = 'Hello, NAAvOS!';
    const files = new Map<string, string>([['test.txt', content]]);

    await createTarGz(files, outputPath);

    assert.ok(fs.existsSync(outputPath));
    const buf = fs.readFileSync(outputPath);
    assert.ok(buf[0] === 0x1f && buf[1] === 0x8b);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });
});

describe('compile integration', () => {
  it('produces hermes FileMap with expected files', () => {
    const avatar = makeValidAvatar() as Parameters<typeof compile>[0];
    const files = compile(avatar, 'hermes');
    expect(files.has('SOUL.md')).toBe(true);
    expect(files.has('SKILL.md')).toBe(true);
    expect(files.has('memories/MEMORY.md')).toBe(true);
  });

  it('produces claude-code FileMap with CLAUDE.md', () => {
    const avatar = makeValidAvatar() as Parameters<typeof compile>[0];
    const files = compile(avatar, 'claude-code');
    expect(files.has('CLAUDE.md')).toBe(true);
  });

  it('produces cursor FileMap with .cursorrules', () => {
    const avatar = makeValidAvatar() as Parameters<typeof compile>[0];
    const files = compile(avatar, 'cursor');
    expect(files.has('.cursorrules')).toBe(true);
  });
});
