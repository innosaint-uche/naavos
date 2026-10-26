import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const temporaryHome = fs.mkdtempSync(path.join(os.tmpdir(), 'naavos-doctor-'));
const cli = path.resolve('packages/cli/bin/naavos.js');
const run = () =>
  spawnSync(process.execPath, [cli, 'doctor'], {
    env: { ...process.env, HOME: temporaryHome },
    encoding: 'utf8',
  });
try {
  assert.equal(run().status, 1, 'doctor must fail when no Avatar exists');
  const source = {
    metadata: {
      package_id: crypto.randomUUID(),
      owner_id: crypto.randomUUID(),
      semantic_version: '1.0.0',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    identity: { name: 'Doctor fixture' },
    communication: { tone: 'Direct', structure: 'Bulleted', verbosity: 'Concise' },
    operating_rules: [
      { id: 'evidence.no_false_completion', statement: 'Use evidence', priority: 90 },
    ],
    privacy: { consents: {} },
    adapters: [{ host_id: 'hermes', min_adapter_version: '1.0.0' }],
    evals: [],
  };
  fs.mkdirSync(path.join(temporaryHome, '.naavos'));
  fs.writeFileSync(path.join(temporaryHome, '.naavos/avatar.json'), JSON.stringify(source));
  assert.equal(run().status, 0, 'doctor must pass for a valid Avatar');
  console.log('CLI doctor: valid and missing-source cases passed');
} finally {
  fs.rmSync(temporaryHome, { recursive: true, force: true });
}
