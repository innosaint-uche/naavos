import assert from 'node:assert/strict';
import { compile, listTargets } from './src/index.js';

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
  communication: { tone: 'Direct', structure: 'Bulleted', verbosity: 'Minimal' },
  operating_rules: [{ id: 'r1', statement: 'Be fast', priority: 80 }],
  privacy: { consents: {} },
  adapters: [{ host_id: 'hermes', min_adapter_version: '1.0.0' }],
  evals: [],
};

const targets = listTargets();
assert.ok(targets.includes('hermes'), 'hermes target should exist');
assert.ok(targets.includes('claude-code'), 'claude-code target should exist');
assert.ok(targets.includes('gemini'), 'gemini target should exist');
assert.ok(targets.includes('openclaw'), 'openclaw target should exist');
assert.ok(targets.includes('cursor'), 'cursor target should exist');
assert.ok(targets.includes('reme'), 'reme target should exist');

const hermesFiles = compile(sample, 'hermes');
assert.ok(hermesFiles instanceof Map, 'compile should return Map');
assert.ok(hermesFiles.has('SOUL.md'), 'hermes output should include SOUL.md');
assert.ok(hermesFiles.has('SKILL.md'), 'hermes output should include SKILL.md');
assert.ok(hermesFiles.has('memories/MEMORY.md'), 'hermes output should include memories/MEMORY.md');

const claudeFiles = compile(sample, 'claude-code');
assert.ok(claudeFiles.has('CLAUDE.md'), 'claude-code output should include CLAUDE.md');

const geminiFiles = compile(sample, 'gemini');
assert.ok(geminiFiles.has('GEMINI.md'), 'gemini output should include GEMINI.md');

const openclawFiles = compile(sample, 'openclaw');
assert.ok(openclawFiles.has('AGENTS.md'), 'openclaw output should include AGENTS.md');

const cursorFiles = compile(sample, 'cursor');
assert.ok(cursorFiles.has('.cursorrules'), 'cursor output should include .cursorrules');

const remeFiles = compile(sample, 'reme');
assert.ok(remeFiles.has('.remerc'), 'reme output should include .remerc');
assert.ok(
  remeFiles.has('skills/reme_memory/SKILL.md'),
  'reme output should include skills/reme_memory/SKILL.md'
);
assert.ok(remeFiles.has('CLAUDE-reme.md'), 'reme output should include CLAUDE-reme.md');

assert.throws(() => compile(sample, 'unknown'), 'unknown target should throw');

console.log('✓ compiler tests passed');
