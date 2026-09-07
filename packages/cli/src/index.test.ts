import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { compile } from '@naavos/compiler';
import { describe, expect, it } from 'vitest';

import { createBackup, createTarGz, listTargets, restoreBackup, saveJournal } from './index.js';

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
      'should be gzip format (magic 0x1f 0x8b)'
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

describe('backup and rollback', () => {
  it('snapshots the existing Hermes files and removes newly-created files on rollback', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'naavos-rollback-'));
    const hermesHome = path.join(tmpDir, 'hermes');
    const backupHome = path.join(tmpDir, '.naavos', 'backups');
    fs.mkdirSync(hermesHome, { recursive: true });
    fs.writeFileSync(path.join(hermesHome, 'SOUL.md'), '# User-authored previous soul\n');

    const previousHome = process.env['HERMES_HOME'];
    const previousHomeDir = process.env['HOME'];
    process.env['HERMES_HOME'] = hermesHome;
    process.env['HOME'] = tmpDir;
    try {
      const avatar = makeValidAvatar() as Parameters<typeof compile>[0];
      const backupId = await createBackup('hermes', avatar);
      const generated = compile(avatar, 'hermes');
      for (const [relativePath, content] of generated) {
        const destination = path.join(hermesHome, relativePath);
        fs.mkdirSync(path.dirname(destination), { recursive: true });
        fs.writeFileSync(destination, content);
      }

      await restoreBackup(backupId);

      expect(fs.readFileSync(path.join(hermesHome, 'SOUL.md'), 'utf8')).toBe(
        '# User-authored previous soul\n'
      );
      expect(fs.existsSync(path.join(hermesHome, 'SKILL.md'))).toBe(false);
      expect(fs.existsSync(path.join(hermesHome, 'memories', 'MEMORY.md'))).toBe(false);
      expect(fs.existsSync(path.join(backupHome, backupId, 'primary', 'SOUL.md'))).toBe(true);
    } finally {
      if (previousHome === undefined) delete process.env['HERMES_HOME'];
      else process.env['HERMES_HOME'] = previousHome;
      if (previousHomeDir === undefined) delete process.env['HOME'];
      else process.env['HOME'] = previousHomeDir;
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('restores ReMe project files and its Hermes skill across both managed roots', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'naavos-reme-rollback-'));
    const projectRoot = path.join(tmpDir, 'project');
    const hermesHome = path.join(tmpDir, 'hermes');
    fs.mkdirSync(projectRoot, { recursive: true });
    fs.mkdirSync(path.join(hermesHome, 'skills', 'reme_memory'), { recursive: true });
    fs.writeFileSync(path.join(projectRoot, '.remerc'), '# Existing ReMe config\n');
    fs.writeFileSync(
      path.join(hermesHome, 'skills', 'reme_memory', 'SKILL.md'),
      '# Existing ReMe skill\n'
    );

    const previousCwd = process.cwd();
    const previousHome = process.env['HOME'];
    const previousHermesHome = process.env['HERMES_HOME'];
    process.chdir(projectRoot);
    process.env['HOME'] = tmpDir;
    process.env['HERMES_HOME'] = hermesHome;
    try {
      const avatar = makeValidAvatar() as Parameters<typeof compile>[0];
      const generated = compile(avatar, 'reme');
      const skill = generated.get('skills/reme_memory/SKILL.md');
      expect(skill).toBeDefined();
      const backupId = await createBackup(
        'reme',
        avatar,
        skill
          ? [{ root: hermesHome, files: new Map([['skills/reme_memory/SKILL.md', skill]]) }]
          : []
      );

      for (const [relativePath, content] of generated) {
        const destination = path.join(projectRoot, relativePath);
        fs.mkdirSync(path.dirname(destination), { recursive: true });
        fs.writeFileSync(destination, content);
      }
      fs.writeFileSync(path.join(hermesHome, 'skills', 'reme_memory', 'SKILL.md'), skill || '');

      await restoreBackup(backupId);

      expect(fs.readFileSync(path.join(projectRoot, '.remerc'), 'utf8')).toBe(
        '# Existing ReMe config\n'
      );
      expect(fs.existsSync(path.join(projectRoot, 'CLAUDE-reme.md'))).toBe(false);
      expect(fs.existsSync(path.join(projectRoot, 'skills', 'reme_memory', 'SKILL.md'))).toBe(
        false
      );
      expect(
        fs.readFileSync(path.join(hermesHome, 'skills', 'reme_memory', 'SKILL.md'), 'utf8')
      ).toBe('# Existing ReMe skill\n');
    } finally {
      process.chdir(previousCwd);
      if (previousHome === undefined) delete process.env['HOME'];
      else process.env['HOME'] = previousHome;
      if (previousHermesHome === undefined) delete process.env['HERMES_HOME'];
      else process.env['HERMES_HOME'] = previousHermesHome;
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('rejects a legacy backup without a managed-file manifest', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'naavos-legacy-backup-'));
    const previousHome = process.env['HOME'];
    process.env['HOME'] = tmpDir;
    try {
      const backupId = 'legacy-hermes-backup';
      const backupDir = path.join(tmpDir, '.naavos', 'backups', backupId);
      fs.mkdirSync(backupDir, { recursive: true });
      fs.writeFileSync(path.join(backupDir, 'SOUL.md'), '# Generated state\n');
      saveJournal([
        {
          id: backupId,
          target: 'hermes',
          created_at: new Date().toISOString(),
          files: ['SOUL.md'],
          snapshot_version: 2,
        },
      ]);

      await expect(restoreBackup(backupId)).rejects.toThrow('cannot be restored safely');
    } finally {
      if (previousHome === undefined) delete process.env['HOME'];
      else process.env['HOME'] = previousHome;
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
