import fs from 'fs';
import assert from 'node:assert/strict';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const NAavOS_BIN = path.join(__dirname, '..', 'cli', 'bin', 'naavos.js');

async function runCLI(args) {
  const { spawn } = await import('child_process');
  return new Promise((resolve, reject) => {
    const proc = spawn('node', [NAavOS_BIN, ...args]);
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (d) => (stdout += d.toString()));
    proc.stderr.on('data', (d) => (stderr += d.toString()));
    proc.on('close', (code) => {
      if (code === 0) resolve(stdout.trim());
      else reject(new Error(`CLI failed (${code}): ${stderr || stdout}`));
    });
  });
}

async function testCompileTarGz() {
  const outputPath = path.join(process.env.HOME, '.naavos', 'avatar-profile.tar.gz');

  try {
    await runCLI(['compile', '--target', 'hermes', '--format', 'tar.gz']);

    assert.ok(fs.existsSync(outputPath), 'tar.gz should exist');

    const contents = fs.readFileSync(outputPath);
    assert.ok(contents[0] === 0x1f && contents[1] === 0x8b, 'should be gzip format');

    console.log('✓ compile --format tar.gz test passed');
  } finally {
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }
  }
}

async function testExportCommand() {
  const outputPath = path.join(process.env.HOME, '.naavos', 'avatar-profile.tar.gz');

  try {
    await runCLI(['compile', '--target', 'hermes']);
    await runCLI(['export', '--target', 'hermes']);

    assert.ok(fs.existsSync(outputPath), 'exported tar.gz should exist');

    const contents = fs.readFileSync(outputPath);
    assert.ok(contents[0] === 0x1f && contents[1] === 0x8b, 'should be gzip format');

    console.log('✓ export command test passed');
  } finally {
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }
  }
}

async function main() {
  await testCompileTarGz();
  await testExportCommand();
  console.log('✓ all tar.gz tests passed');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
